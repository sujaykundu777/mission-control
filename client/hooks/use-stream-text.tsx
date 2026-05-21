import { useState, useEffect } from "react";

const useStreamText = (text: string, delay: number = 50) => {
  const [streamedText, setStreamedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setStreamedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index, text, delay]);

  return streamedText;
};

export default useStreamText;
