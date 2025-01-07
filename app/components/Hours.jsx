import React from 'react';
import {useLocation} from '@remix-run/react';

function Hours() {
  const {pathname} = useLocation();
  function style() {
    return {
      color: pathname !== '/' && pathname !== '/info' ? 'var(--blue)' : null,
      borderColor:
        pathname !== '/' && pathname !== '/info' ? 'var(--blue)' : null,
    };
  }
  return (
    <div className="hours-container">
      <p style={style()}>HOURS</p>
      <p style={style()}>
        MONDAY: 7AM-5PM
        <br />
        TUESDAY: 7AM-5PM
        <br />
        WEDNESDAY: 7AM-5PM
        <br />
        THURSDAY: 7AM-5PM
        <br />
        FRIDAY: 7AM-5PM
        <br />
        SATURDAY: 7AM-5PM
        <br />
        SUNDAY: 7AM-5PM
        <br />
      </p>
    </div>
  );
}

export default Hours;
