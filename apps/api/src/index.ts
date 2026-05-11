import app from './app';

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
