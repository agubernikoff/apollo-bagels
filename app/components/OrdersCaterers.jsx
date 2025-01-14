import React from 'react';
import {useLocation} from 'react-router-dom';

function OrdersCaterers({data}) {
  const {pathname} = useLocation();
  console.log(data);
  return (
    <div className="order-cater-container">
      <div className="order-cater-text-container">
        {pathname === '/order' && (
          <p>
            Place your pickup order via Toast at any of our locations until 2
            PM.
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
      <div className="order-cater-locations">
        {data
          .slice()
          .reverse()
          .map((location) => {
            const {title, address, orderLink, cateringLink} = location;

            const formattedAddress = (
              <>
                {address.street},{<br />}
                {address.city}, {address.state} {address.postalCode}
              </>
            );
            const link =
              pathname === '/order'
                ? orderLink
                : pathname === '/catering'
                ? cateringLink
                : '#';

            return (
              <div key={location._id} className="location-item">
                <p
                  style={{
                    backgroundColor:
                      pathname === '/order' ? 'var(--blue)' : 'var(--yellow)',
                  }}
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="location-link"
                    style={{
                      color:
                        pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
                    }}
                  >
                    {title}
                  </a>
                </p>
                <p
                  style={{
                    backgroundColor:
                      pathname === '/order' ? 'var(--blue)' : 'var(--yellow)',
                    fontFamily: 'HAL',
                  }}
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color:
                        pathname === '/order' ? 'var(--creme)' : 'var(--blue)',
                    }}
                  >
                    {formattedAddress}
                  </a>
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default OrdersCaterers;
