export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const imageRow = rows[0];
  const contentRow = rows[1];

  imageRow.classList.add('newsletter-image');
  contentRow.classList.add('newsletter-content');

  const contentCol = contentRow.querySelector(':scope > div');
  if (!contentCol) return;

  const form = document.createElement('form');
  form.classList.add('newsletter-form');
  form.addEventListener('submit', (e) => e.preventDefault());

  const input = document.createElement('input');
  input.type = 'email';
  input.placeholder = 'YOUR EMAIL ADDRESS';
  input.required = true;
  input.setAttribute('aria-label', 'Email address');

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = 'SIGN UP';

  form.append(input, button);
  contentCol.append(form);
}
