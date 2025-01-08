import React from 'react';
import {useLocation} from '@remix-run/react';

function transform(day) {
  const {start, end} = day;

  return `${formatTimeTo12Hour(start)}-${formatTimeTo12Hour(end)}`;
}

function formatTimeTo12Hour(timeString) {
  const [hour, minute] = timeString.split(':').map(Number);

  const isPM = hour >= 12;
  const formattedHour = hour % 12 || 12; // Convert to 12-hour format, 0 becomes 12
  const period = isPM ? 'PM' : 'AM';

  return `${formattedHour}${period}`;
}

function Hours({hours}) {
  const {pathname} = useLocation();
  function style() {
    return {
      color: pathname !== '/' && pathname !== '/info' ? 'var(--blue)' : null,
      borderColor:
        pathname !== '/' && pathname !== '/info' ? 'var(--blue)' : null,
    };
  }

  const daysOfWeek = [
    {name: 'MONDAY', key: 'monday'},
    {name: 'TUESDAY', key: 'tuesday'},
    {name: 'WEDNESDAY', key: 'wednesday'},
    {name: 'THURSDAY', key: 'thursday'},
    {name: 'FRIDAY', key: 'friday'},
    {name: 'SATURDAY', key: 'saturday'},
    {name: 'SUNDAY', key: 'sunday'},
  ];

  return (
    <div className="hours-container">
      <p style={style()}>HOURS</p>
      <p style={style()}>
        {daysOfWeek.map(({name, key}) => (
          <span key={key}>
            {`${name}: ${transform(hours[key])}`}
            <br />
          </span>
        ))}
      </p>
    </div>
  );
}

export default Hours;
