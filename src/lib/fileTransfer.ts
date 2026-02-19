/**
 * Utility to upload files to file.io for temporary hosting.
 * This is used to bypass payload size limits in serverless functions (like Vercel).
 */

export async function uploadToFileIO(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('https://file.io', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`file.io upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success) {
            return data.link; // The temporary URL
        } else {
            throw new Error(`file.io upload failed: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error uploading to file.io:', error);
        throw error;
    }
}
