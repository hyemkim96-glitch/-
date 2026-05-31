// icons.jsx — Remixicon icon set via CSS font (remixicon.css loaded in HTML)
// Each component accepts { size, style } matching the previous Lucide API.

function Ri({ name, size = 24, style }) {
  return (
    <i className={`ri-${name}`} style={{
      fontSize: size,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontStyle: 'normal',
      ...style
    }} />
  );
}

const IconPin        = (p) => <Ri name="map-pin-2-fill"          {...p} />;
const IconTrash      = (p) => <Ri name="delete-bin-6-line"       {...p} />;
const IconPlus       = (p) => <Ri name="add-line"                {...p} />;
const IconSearch     = (p) => <Ri name="search-2-line"           {...p} />;
const IconWon        = (p) => <Ri name="money-won-circle-line"   {...p} />;
const IconInfo       = (p) => <Ri name="information-line"        {...p} />;
const IconCheck      = (p) => <Ri name="check-line"              {...p} />;
const IconWallet     = (p) => <Ri name="wallet-3-line"           {...p} />;
const IconClock      = (p) => <Ri name="time-line"               {...p} />;
const IconChevDown   = (p) => <Ri name="arrow-down-s-line"       {...p} />;
const IconChevRight  = (p) => <Ri name="arrow-right-s-line"      {...p} />;
const IconMap        = (p) => <Ri name="map-2-line"              {...p} />;
const IconList       = (p) => <Ri name="list-check-2"            {...p} />;
const IconClose      = (p) => <Ri name="close-line"              {...p} />;
const IconArrowRight = (p) => <Ri name="arrow-right-line"        {...p} />;
const IconSubway     = (p) => <Ri name="subway-line"             {...p} />;
const IconStore      = (p) => <Ri name="store-2-line"            {...p} />;
const IconCart       = (p) => <Ri name="shopping-cart-2-line"    {...p} />;
const IconHospital   = (p) => <Ri name="hospital-line"           {...p} />;
const IconCar        = (p) => <Ri name="car-line"                {...p} />;
const IconBus        = (p) => <Ri name="bus-line"                {...p} />;
const IconWalk       = (p) => <Ri name="walk-line"               {...p} />;
const IconExternal   = (p) => <Ri name="external-link-line"      {...p} />;
const IconBuilding   = (p) => <Ri name="building-4-line"         {...p} />;
const IconHome       = (p) => <Ri name="home-5-line"             {...p} />;

Object.assign(window, {
  Ri, IconPin, IconTrash, IconPlus, IconSearch, IconWon, IconInfo, IconCheck,
  IconWallet, IconClock, IconChevDown, IconChevRight, IconMap, IconList, IconClose,
  IconArrowRight, IconSubway, IconStore, IconCart, IconHospital, IconCar, IconBus,
  IconWalk, IconExternal, IconBuilding, IconHome
});
