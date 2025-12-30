import { Link } from 'react-router-dom';
import './Navigation.css';

export default function Navigation() {
  return (
    <nav className="nav">
      <Link to="/upload">Upload</Link>
      <Link to="/camera">Camera</Link>
    </nav>
  );
}
