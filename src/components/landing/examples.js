import React, { useContext } from "react";
import { SitesContext } from "../../contexts/sitesContext";
import example1 from "../assets/examples/example1.png";
import example2 from "../assets/examples/example2.png";
import example3 from "../assets/examples/example3.png";

import styles from "./examples.module.css";

const Examples = () => {
  const { themeObj } = useContext(SitesContext);

  return (
    <div className={styles.examples} style={{ backgroundColor: themeObj.landingCardBackground }}>
      <div id="examples" className={styles.anchor} />
      <h1>Examples</h1>
      <ul className={styles.exampleList}>
        <a href='https://example1.mostlink.dev' target="_blank" rel="noreferrer">
          <li className={styles.example}>
            <img src={example1} alt='example1' />
          </li>
        </a>
        <a href='https://example2.mostlink.dev' target="_blank" rel="noreferrer">
          <li className={styles.example}>
            <img src={example2} alt='example2' />
          </li>
        </a>
        <a href='https://example3.mostlink.dev' target="_blank" rel="noreferrer">
          <li className={styles.example}>
            <img src={example3} alt='example3' />
          </li>
        </a>
      </ul>
    </div>
  );
};

export default Examples;