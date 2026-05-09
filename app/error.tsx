"use client";

export default function Error({ error, reset }: any) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Something went wrong!</h2>
      <button 
      type="button"
      onClick={() => reset()}>Try again</button>
    </div>
  );
}
