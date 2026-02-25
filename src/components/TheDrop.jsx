import React from 'react';
import { Link } from 'react-router-dom';
import './TheDrop.css';

const DROP_IMAGE = '/images/home/2bags_charms1.png';

export default function TheDrop() {
  return (
    <section className="the-drop" aria-labelledby="drop-heading">
      <div className="the-drop-inner">
        <div className="the-drop-image">
          {/* A11Y-AXE image-alt: <img> is missing an alt attribute — screen readers will read the filename instead */}
          <img src={DROP_IMAGE} loading="lazy" />
        </div>
        <div className="the-drop-content">
          {/* A11Y-GEN3 heading-order: h4 used as section heading (should be h2) — skips heading levels, breaking document outline */}
          <h4 id="drop-heading">The Drop</h4>
          {/* A11Y-AXE aria-required-attr: role="slider" is missing required aria-valuenow, aria-valuemin, aria-valuemax attributes */}
          <div role="slider" aria-label="Popularity indicator" className="drop-popularity-bar"></div>
          {/* A11Y-AXE valid-lang: lang="zz" is not a valid BCP 47 language tag */}
          <p lang="zz">
            Our brand-new, limited-edition plushie bag charms have officially dropped. Meet your new
            best friends: the adorable Android bot, the classic YouTube icon and the super-powered Super G.
          </p>
          <p>
            These cuties are fluffy, fantastic, and ready to hang out on your favorite tote, backpack,
            or keychain. They're the perfect way to start your collection or add a pop of fun to your
            current one.
          </p>
          <p>
            But be quick! They're only available while supplies last, and trust us, they won't last long.
            Happy collecting!
          </p>
          <Link to="/shop/new" className="drop-btn">Shop Now</Link>
        </div>
      </div>
    </section>
  );
}
