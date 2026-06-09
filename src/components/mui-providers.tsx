import { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';

import { useTheme } from '@/components/theme-provider';

/**
 * Bridges MUI's theming + date-pickers localization into the app.
 * MUI lives in its own React context, so without this its portalled popups would
 * always render light-themed. We mirror the app's `.dark` mode onto a MUI theme and
 * register the date-fns adapter (the app already depends on date-fns).
 */
export function MuiProviders({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    const mode: 'light' | 'dark' =
        theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
            : theme;

    const muiTheme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode,
                    primary: { main: '#680202' },
                },
                shape: { borderRadius: 6 },
            }),
        [mode],
    );

    return (
        <MuiThemeProvider theme={muiTheme}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                {children}
            </LocalizationProvider>
        </MuiThemeProvider>
    );
}
