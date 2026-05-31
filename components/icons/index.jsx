// icons/index.jsx — Remixicon components

function Ri({ name, size = 24, style }) {
  return (
    <i
      className={`ri-${name}`}
      style={{
        fontSize: size,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontStyle: 'normal',
        ...style,
      }}
    />
  );
}

export const IconPin        = (p) => <Ri name="map-pin-2-fill"          {...p} />;
export const IconTrash      = (p) => <Ri name="delete-bin-6-line"       {...p} />;
export const IconPlus       = (p) => <Ri name="add-line"                {...p} />;
export const IconSearch     = (p) => <Ri name="search-2-line"           {...p} />;
export const IconWon        = (p) => <Ri name="money-won-circle-line"   {...p} />;
export const IconInfo       = (p) => <Ri name="information-line"        {...p} />;
export const IconCheck      = (p) => <Ri name="check-line"              {...p} />;
export const IconWallet     = (p) => <Ri name="wallet-3-line"           {...p} />;
export const IconClock      = (p) => <Ri name="time-line"               {...p} />;
export const IconChevDown   = (p) => <Ri name="arrow-down-s-line"       {...p} />;
export const IconChevRight  = (p) => <Ri name="arrow-right-s-line"      {...p} />;
export const IconMap        = (p) => <Ri name="map-2-line"              {...p} />;
export const IconList       = (p) => <Ri name="list-check-2"            {...p} />;
export const IconClose      = (p) => <Ri name="close-line"              {...p} />;
export const IconArrowRight = (p) => <Ri name="arrow-right-line"        {...p} />;
export const IconSubway     = (p) => <Ri name="subway-line"             {...p} />;
export const IconStore      = (p) => <Ri name="store-2-line"            {...p} />;
export const IconCart       = (p) => <Ri name="shopping-cart-2-line"    {...p} />;
export const IconHospital   = (p) => <Ri name="hospital-line"           {...p} />;
export const IconCar        = (p) => <Ri name="car-line"                {...p} />;
export const IconBus        = (p) => <Ri name="bus-line"                {...p} />;
export const IconWalk       = (p) => <Ri name="walk-line"               {...p} />;
export const IconExternal   = (p) => <Ri name="external-link-line"      {...p} />;
export const IconBuilding   = (p) => <Ri name="building-4-line"         {...p} />;
export const IconHome       = (p) => <Ri name="home-5-line"             {...p} />;
export const IconSort       = (p) => <Ri name="sort-desc"               {...p} />;
export const IconFilter     = (p) => <Ri name="filter-3-line"           {...p} />;
