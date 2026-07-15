export default function InvalidData({ errors }) {
  return (
    <main className="app">
      <section className="card invalid-data" role="alert">
        <h1>Question data needs attention</h1>
        <p>Fix these issues in src/assets/data.json before starting a quiz.</p>
        <ul>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
