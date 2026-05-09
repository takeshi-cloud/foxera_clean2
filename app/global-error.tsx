"use client";

export default function GlobalError({ error, reset }: any) {
  return (
    <html>
      <body>
        <h2>Global Error</h2>
        <button
        type="button"
         onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
