import { CSSProperties, JSX, useCallback, useState } from "react";

const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  borderWidth: 0,
};

export function useAnnouncer(): {
  announce: (message: string) => void;
  Announcer: () => JSX.Element;
} {
  const [message, setMessage] = useState("");

  const announce = useCallback((next: string) => setMessage(next), []);

  const Announcer = useCallback(
    () => (
      <div role="status" aria-live="polite" aria-atomic="true" style={srOnly}>
        {message}
      </div>
    ),
    [message]
  );

  return { announce, Announcer };
}
