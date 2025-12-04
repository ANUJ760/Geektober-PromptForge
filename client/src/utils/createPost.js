export default function Upload(formData) {
    console.log("Creating post with data:", formData);
    const data = Object.fromEntries(formData.entries());
    console.log("Transformed data:", data);
}