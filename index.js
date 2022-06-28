require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

require("colors")


const main = async () => {

    let opt;
    const busquedas = new Busquedas();

    do{

        console.clear();

        opt = await inquirerMenu();

        switch (opt) {
            case 1:

                // Mostrar mensaje

                const termino = await leerInput("¿Qué ciudad quiere averiguar el clima?")
                const lugares = await busquedas.ciudad(termino);

                const id      = await listarLugares(lugares);

                if (id === '0') continue;

                const lugarSeleccionado = lugares.find( l => l.id === id );

                const {nombre, lng, lat} = lugarSeleccionado;
                // Buscar los lugares
                

                // Seleccionar el lugar

                // Clima

                const clima = await busquedas.climaLugar(lat, lng)

                const {desc, min, max, temp} = clima;

                // Guardar en DB
                
                busquedas.agregarHistorial(nombre);

                // Mostrar resultados

                console.log("\nInformación de la ciudad\n".green)

                console.log('Ciudad:', nombre.blue)
                console.log('Lat:', lat.toString().blue)
                console.log('Lng:', lng.toString().blue)
                console.log('Temperatura:', temp.toString().blue)
                console.log('Mínima:', min.toString().blue)
                console.log('Máxima:', max.toString().blue)
                console.log('¿Cómo está el clima?', desc.toString().blue)

                break;
        
            case 2:
                
                busquedas.historialCapitalizado.forEach((lugar, i)  => {
                    const idx = `${i + 1}`.green;
                    console.log(`${idx} ${lugar}`)
                })

                

                break;
                
        }

        if (opt !== 0) await pausa();

    } while(opt !== 0)
    
}
main(); 