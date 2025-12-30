import { useState } from 'react';
import './UploadPage.css';

type Person = {
  name: string;
  images: string[]; // base64 images
};

const STORAGE_KEY = 'face-db';

function loadDataset(): Person[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDataset(data: Person[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UploadPage() {
  const [name, setName] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [dataset, setDataset] = useState<Person[]>(() => loadDataset());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || !files || files.length === 0) return alert('Please provide a name and at least one image');

    const dataUrls = await Promise.all(Array.from(files).map((f) => readFileAsDataUrl(f)));

    const idx = dataset.findIndex((p) => p.name.toLowerCase() === trimmed.toLowerCase());
    const newDataset = dataset.slice();
    if (idx >= 0) {
      newDataset[idx] = { ...newDataset[idx], images: [...newDataset[idx].images, ...dataUrls] };
    } else {
      newDataset.unshift({ name: trimmed, images: dataUrls });
    }

    setDataset(newDataset);
    saveDataset(newDataset);
    setName('');
    setFiles(null);
    (document.getElementById('file-input') as HTMLInputElement).value = '';
  }

  function removePerson(i: number) {
    const newDataset = dataset.filter((_, idx) => idx !== i);
    setDataset(newDataset);
    saveDataset(newDataset);
  }

  function removeImage(personIdx: number, imgIdx: number) {
    const newDataset = dataset.slice();
    newDataset[personIdx] = { ...newDataset[personIdx], images: newDataset[personIdx].images.filter((_, j) => j !== imgIdx) };
    if (newDataset[personIdx].images.length === 0) {
      newDataset.splice(personIdx, 1);
    }
    setDataset(newDataset);
    saveDataset(newDataset);
  }

  return (
    <div className="upload-page">
      <h2>Upload person images</h2>
      <form onSubmit={onSubmit} className="upload-form">
        <input
          placeholder="Person name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          id="file-input"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setFiles(e.target.files)}
        />
        <button type="submit">Upload</button>
      </form>

      <h3>Dataset ({dataset.length})</h3>
      <div className="dataset-list">
        {dataset.map((p, i) => (
          <div className="dataset-item" key={i}>
            <div className="person-header">
              <div className="name">{p.name}</div>
              <div className="count">{p.images.length} image{p.images.length !== 1 ? 's' : ''}</div>
              <button onClick={() => removePerson(i)}>Delete person</button>
            </div>
            <div className="images-grid">
              {p.images.map((img, j) => (
                <div className="thumb" key={j}>
                  <img src={img} alt={`${p.name}-${j}`} />
                  <button className="del-img" onClick={() => removeImage(i, j)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
