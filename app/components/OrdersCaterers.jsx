import React from 'react';
import {useLocation} from 'react-router-dom';

function OrdersCaterers() {
  const {pathname} = useLocation();

  return (
    <div className="order-cater-text-container">
      {pathname === '/order' && (
        <p>
          Place your pickup order via Toast at any of our locations until 2 PM.
          <br></br>
          Select your preferred location below.
        </p>
      )}
      {pathname === '/catering' && (
        <p>
          We offer catering from all locations on ezCater. Please select your
          desired location below.<br></br>Please email{' '}
          <a className="oc-link" href="mailto:catering@apollobagels.com">
            catering@apollobagels.com
          </a>{' '}
          for all other catering inquiries.
        </p>
      )}
    </div>
  );
}

export default OrdersCaterers;
