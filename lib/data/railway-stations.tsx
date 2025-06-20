export interface Station {
    id: string;
    x: number;
    y: number;
    label: string;
    width?: number;
    height?: number;
    fontSize?: number;
  }

export const stations: Station[] = [
    {
        id: "INSTALACION",
        x: 205,
        y: 100,
        label: "INSTALACIÓN\nTALLERES Y\nCOCHERAS"
    },
    {
        id: "QUITUMBE",
        x: 1175,
        y: 100,
        label: "QUITUMBE"
    },
    {
        id: "MORÁN VALVERDE",
        x: 1990,
        y: 100,
        label: "MORÁN VALDERDE"
    },
    {
        id: "SOLANDA",
        x: 3050,
        y: 100,
        label: "SOLANDA"
    },
    {
        id: "CARDENAL DE LA TORRE",
        x: 3320,
        y: 100,
        label: "CARDENAL DE LA TORRE",
        width: 58.5
    },
    {
        id: "RECREO",
        x: 3980,
        y: 100,
        label: "RECREO"
    },
    {
        id: "LA MAGDALENA",
        x: 1150,
        y: 525,
        label: "LA MAGDALENA"
    },
    {
        id: "SAN FRANCISCO",
        x: 2260,
        y: 525,
        label: "SAN FRANCISCO"
    },
    {
        id: "EL EJIDO",
        x: 3300,
        y: 525,
        label: "EL EJIDO"
    },
    {
        id: "UNIVERSIDAD CENTRAL",
        x: 280,
        y: 1000,
        label: "UNIVERSIDAD CENTRAL"
    },
    {
        id: "LA PRADERA",
        x: 780,
        y: 1000,
        label: "LA PRADERA"
    },
    {
        id: "LA CAROLINA",
        x: 1000,
        y: 1000,
        label: "LA CAROLINA"
    },
    {
        id: "IÑAQUITO",
        x: 1540,
        y: 1000,
        label: "IÑAQUITO"
    },
    {
        id: "JIPIJAPA",
        x: 1870,
        y: 1000,
        label: "JIPIJAPA"
    },
    {
        id: "EL LABRADOR",
        x: 2580,
        y: 1000,
        label: "EL LABRADOR"
    },
]