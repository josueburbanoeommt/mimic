import { NextResponse } from 'next/server';

interface RailwayData {
  "Fecha Inicio:": string;
  "Fecha Fin:": string;
  "Horario:": string;
  "Mantenedor:": string;
  "Tipo MEX:": string;
  "Ubicación:": string;
  "Catenaria Desenergizada:": string[];
  "Catenaria Neutra:": string[];
  "CV": string[];
  "Agujas:": string[];
  "Señales:": string[];
  "Tramos de Vía": string[];
  "Superior Altura Hombre: ": string;
  "Trenes: ": string[];
  "Sistema Trenes: ": string[];
  "Vía trabajo tren: ": string;
  "Estaciones: ": string[];
  "Desen. Estación": string;
  "Sistema Estaciones: ": string[];
  "Desen. Cuarto": string;
  "Pozos: ": string[];
  "Desen. Pozo": string;
  "Sistema Pozos: ": string[];
  "Desen. Sistema": string;
  "Detalle trabajos": string;
}

const API_URL = 'https://mimico.onrender.com/datos';

// GET handler for all railway data
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schedule = searchParams.get('schedule');
    const date = searchParams.get('date');
    const type = searchParams.get('type');

    if(type !== 'Catenaria Desenergizada:' && type !== 'CV') {
      return NextResponse.json({success: false, error: "Invalid type"});
    }

    const response = await fetch(API_URL);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `HTTP error! status: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data: RailwayData[] = await response.json();

    if(date) {
      const filteredData = data.filter(item => {
        const itemStartDate = new Date(item["Fecha Inicio:"]);
        const itemEndDate = new Date(item["Fecha Fin:"]);
        const filterStartDate = new Date(date);
        return schedule ? 
        (itemStartDate >= filterStartDate) && (itemEndDate >= filterStartDate) && (item["Horario:"].toLowerCase().trim() == schedule.toLowerCase().trim()) : 
        (itemStartDate >= filterStartDate) && (itemEndDate >= filterStartDate);
      });
      if(filteredData.length === 0) {
        return NextResponse.json({success: false, error: "No data found"});
      }
      return NextResponse.json({success: true, data: filteredData.map((item: RailwayData) => item[type as keyof RailwayData])});
    }
    return NextResponse.json({success: false, error: "Params not provided"});
  } catch (error) {
    console.error('Error fetching railway data:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 