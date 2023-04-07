import React from "react";
import ReactDOM from "react-dom";
import Footer from "../components/Footer";
import { act } from "react-dom/test-utils";

describe("Footer", () => {
  it("renders the correct text", () => {
    const container = document.createElement("div");
    act(() => {
      ReactDOM.render(<Footer />, container);
    });
    const paragraph = container.querySelector("p");
    expect(paragraph.textContent).toBe("Chronicles & Musing");
    ReactDOM.unmountComponentAtNode(container);
  });
});
