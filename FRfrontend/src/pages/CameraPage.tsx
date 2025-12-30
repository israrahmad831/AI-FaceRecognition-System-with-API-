import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import './CameraPage.css';


type Person = { name: string; images: string[] };
const STORAGE_KEY = 'face-db';

function loadDataset(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as any[];
    // Normalize older format
    return parsed.map((item) => {
      if (item.images && Array.isArray(item.images)) return { name: item.name, images: item.images };
      if (item.imageData) return { name: item.name, images: [item.imageData] };
      return { name: item.name, images: item.images ?? [] };
    });
  } catch {
    return [];
  }
}

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState('Loading models...');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runRecognitionLoop = async () => {
    const labeled = await buildLabeledDescriptors();
    if (labeled.length === 0) {
      setStatus('No labeled faces in dataset. Please upload images first');
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faceMatcher: any = new (faceapi as any).FaceMatcher(labeled, 0.6);

    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const id = window.setInterval(async () => {
      if (video.paused || video.ended) return;
      const detections = await (faceapi as any)
        .detectAllFaces(video)
        .withFaceLandmarks()
        .withFaceDescriptors();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resized = (faceapi as any).resizeResults(detections, { width: video.videoWidth, height: video.videoHeight });

      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (resized as any[]).forEach((d: any) => {
        const best = faceMatcher.findBestMatch(d.descriptor);
        const box = d.detection.box;
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        let text = 'Not matching with anyone';
        if (best.label !== 'unknown') {
          const distance = best.distance; // lower is better
          // Map distance to percent (rough)
          const percent = Math.max(0, Math.round((1 - distance / 0.6) * 100));
          text = `${best.label} — ${percent}%`;
        }

        ctx.fillStyle = 'lime';
        ctx.font = '16px Arial';
        ctx.fillText(text, box.x, box.y > 20 ? box.y - 6 : box.y + 6 + 16);
      });
    }, 250);

    // clear interval on unmount or when restarting
    (videoRef.current as HTMLVideoElement).onpause = () => clearInterval(id);
  }

  function startVideo() {
    setStatus('Starting camera...');
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setStatus('Camera running');
        // ensure runRecognitionLoop is scheduled
        setTimeout(() => runRecognitionLoop(), 0);
      }
    });
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        // load models from local public/models folder
        await (faceapi as any).nets.ssdMobilenetv1.loadFromUri('/models');
        await (faceapi as any).nets.faceLandmark68Net.loadFromUri('/models');
        await (faceapi as any).nets.faceRecognitionNet.loadFromUri('/models');
        if (!mounted) return;
        setStatus('Models loaded');
        startVideo();
      } catch {
        setStatus('Failed to load models. Check network or host models locally in /public/models');
      }
    }

    loadModels();

    return () => {
      mounted = false;
    };
  }, []);

  async function buildLabeledDescriptors() {
    const dataset = loadDataset();
    // use any to avoid missing types
    const labeledDescriptors: any[] = [];
    for (const person of dataset) {
      const descriptors: any[] = [];
      for (const imgData of person.images) {
        try {
          const img = await loadImage(imgData);
          const detection = await (faceapi as any)
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) descriptors.push(detection.descriptor);
        } catch {
          // ignore individual image errors
        }
      }
      if (descriptors.length > 0) {
        labeledDescriptors.push(new (faceapi as any).LabeledFaceDescriptors(person.name, descriptors));
      }
    }
    return labeledDescriptors;
  }

  function loadImage(dataUrl: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  }


  return (
    <div className="camera-page">
      <h2>Camera Recognition</h2>
      <p>{status}</p>
      <div className="video-wrap">
        <video ref={videoRef} className="video" />
        <canvas ref={canvasRef} className="overlay" />
      </div>
      <p className="hint">Make sure you have uploaded at least one labeled image in the Upload page.</p>
    </div>
  );
}
