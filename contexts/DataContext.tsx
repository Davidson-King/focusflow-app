import React, { createContext, useState, useCallback, PropsWithChildren, useContext } from 'react';

interface DataContextType {
  dataVersion: number;
  incrementDataVersion: () => void;
}

export const DataContext = createContext<DataContextType>({
  dataVersion: 0,
  incrementDataVersion: () => {},
});

export const useDataVersion = () => useContext(DataContext);

export const DataProvider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const [dataVersion, setDataVersion] = useState(0);

    const incrementDataVersion = useCallback(() => {
        setDataVersion(v => v + 1);
    }, []);

    const value = { dataVersion, incrementDataVersion };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};
