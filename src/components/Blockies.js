import Blockies from 'react-blockies';

export const Blockie = ({ address }) => (
  <Blockies
    seed={address}
    size={10}
    scale={3}
    color="#dfe"
    bgColor="#aaa"
    spotColor="#000"
    className="identicon"
  />
)