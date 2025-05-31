"use client";
import useSample from "../../../hooks/fetchSample";

export default function SampleScreen() {
  const { data, loading, error } = useSample();
  console.log(data);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <p>{data?.role}</p>
    </div>
  );
}
