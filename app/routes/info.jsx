import info from '../assets/info.png';

export default function Info() {
  function Announcement({data}) {
    return (
      <div className="info-announcement-container">
        <p>
          Apollo Bagels dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Follow us on Instagram: @apollobagels
        </p>
        <br></br>
        <p>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </p>
        <br></br>
        <p>
          For Press and General Inquiries:<br></br>
          <span style={{fontFamily: 'HAL-BOLD'}}>hello@apollobagels.com</span>
        </p>
        <br></br>
        <p>
          Follow us on Instagram:<br></br>
          <span style={{fontFamily: 'HAL-BOLD'}}>@apollobagels</span>
        </p>
      </div>
    );
  }

  return (
    <div className="info">
      <img className="info-background" src={info} />
      <Announcement />
    </div>
  );
}
