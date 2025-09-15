import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

type Props = { text: string };

export default function Markdown({ text }: Props) {
  const html = React.useMemo(() => {
    const raw = marked.parse(text ?? "", { async: false }) as string;
    return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
  }, [text]);
  return (
    <div
      className="md"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
