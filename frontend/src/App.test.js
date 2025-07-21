import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../src/App';

function renderWithRouter(component) {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
}

test('renders navigation', () => {
  renderWithRouter(<App />);
  const navElement = screen.getByText(/San2Stic/i);
  expect(navElement).toBeInTheDocument();
});

test('renders home page content', () => {
  renderWithRouter(<App />);
  const headerElement = screen.getByText(/Découvrez des paysages sonores/i);
  expect(headerElement).toBeInTheDocument();
});