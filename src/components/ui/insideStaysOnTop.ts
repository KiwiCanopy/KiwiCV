import { createContext, useContext } from 'react';

/** Inside a `staysOnTop` frame: a nested dialog's open must not remount its own host. */
export const InsideStaysOnTopContext = createContext(false);

/** For a dialog primitive other than `DialogFrame` (`Sheet`) deciding whether to count its open. */
export const useInsideStaysOnTop = (): boolean => useContext(InsideStaysOnTopContext);
