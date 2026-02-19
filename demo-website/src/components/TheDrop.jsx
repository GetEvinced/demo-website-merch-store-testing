import React from 'react';
import { Link } from 'react-router-dom';
import './TheDrop.css';

const DROP_IMAGE = 'https://ik.imagekit.io/RM/store/20160512512/assets/images/Home%20Page/2bags_charms1.png?tr=w-600';

export default function TheDrop() {
  return (
    <section className="the-drop" aria-labelledby="drop-heading">
      <div className="the-drop-inner">
        <div className="the-drop-image">
          <img src={DROP_IMAGE} alt="Google Keychains - plushie bag charms" loading="lazy" />
        </div>
        <div className="the-drop-content">
          <h2 id="drop-heading">The Drop</h2>
          <p>
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
