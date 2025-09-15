export default function FeedbackForm() {
  return (
    <form
      action="https://formspree.io/f/your-id"
      method="POST"
      style={{ display: "flex", gap: 8 }}
    >
      <input type="email" name="email" placeholder="Email (optional)" />
      <input type="text" name="message" placeholder="Feedback" required />
      <button type="submit">Send</button>
    </form>
  );
}
