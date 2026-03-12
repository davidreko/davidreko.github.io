export class InputManager {
  private keys = new Set<string>();
  private justPressed = new Set<string>();

  constructor() {
    if (typeof window === "undefined") return;
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Escape"].includes(
        e.key
      )
    ) {
      e.preventDefault();
    }
    if (!this.keys.has(e.key)) {
      this.justPressed.add(e.key);
    }
    this.keys.add(e.key);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key);
  };

  isDown(key: string): boolean {
    return this.keys.has(key);
  }

  wasPressed(key: string): boolean {
    return this.justPressed.has(key);
  }

  /** Call at end of each frame */
  flush() {
    this.justPressed.clear();
  }

  left(): boolean {
    return this.isDown("ArrowLeft") || this.isDown("a");
  }

  right(): boolean {
    return this.isDown("ArrowRight") || this.isDown("d");
  }

  up(): boolean {
    return this.isDown("ArrowUp") || this.isDown("w");
  }

  down(): boolean {
    return this.isDown("ArrowDown") || this.isDown("s");
  }

  space(): boolean {
    return this.wasPressed(" ");
  }

  escape(): boolean {
    return this.wasPressed("Escape");
  }

  reset(): boolean {
    return this.wasPressed("r") || this.wasPressed("R");
  }

  anyKey(): boolean {
    return this.justPressed.size > 0;
  }

  destroy() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
