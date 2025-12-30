import { useState } from 'react';
import './UploadPage.css';

type Person = {
  name: string;
  imageData: string; // base64
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

export default function UploadPage() {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dataset, setDataset] = useState<Person[]>(() => loadDataset());

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !file) return alert('Please provide name and image');

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDataset = [{ name, imageData: dataUrl }, ...dataset];
      setDataset(newDataset);
      saveDataset(newDataset);
      setName('');
      setFile(null);
      (document.getElementById('file-input') as HTMLInputElement).value = '';
    };
    reader.readAsDataURL(file);
  }

  function removeItem(i: number) {
    const newDataset = dataset.filter((_, idx) => idx !== i);
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
          onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        />
        <button type="submit">Upload</button>
      </form>

      <h3>Dataset ({dataset.length})</h3>
      <div className="dataset-list">
        {dataset.map((p, i) => (
          <div className="dataset-item" key={i}>
            <img src={p.imageData} alt={p.name} />
            <div className="meta">
              <div className="name">{p.name}</div>
              <button onClick={() => removeItem(i)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
