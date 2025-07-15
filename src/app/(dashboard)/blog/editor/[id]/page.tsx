// Blog editor page for editing a specific post
export default async function BlogEditorIdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <div>Blog Editor Page for ID: {id}</div>;
} 