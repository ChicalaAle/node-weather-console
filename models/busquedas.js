const fs = require('fs')

const axios = require('axios')


class Busquedas{

    historial = [];
    dbPath = './db/database.json';

    constructor(){
        //TODO: LEER DB SI EXISTE
        this.leerDB();
    }

    get historialCapitalizado(){

        //Capitalizar cada palabra

        return this.historial.map(lugar => {
            
            let textoArr = lugar.split(' ');

            textoArr = textoArr.map(p => p[0].toUpperCase() + p.substring(1));

            return textoArr.join(' ')
        })        

    }

    get paramsMapbox(){
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsWeather(){
        return {
            'appid': process.env.OPENWEATHER_KEY,            
            'units': 'metric',
            'lang': 'es'
        }
    }

    async ciudad(lugar = ''){

        try {
            // Petición http

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            return resp.data.features.map( lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1],
            }))



        } catch (error) {

            const { code } = error;
            const { url, method } = error.config;

            console.log({
                code,
                url,
                method
            })

        }
        

        return []; //Retornar los lugares que coincidan con el parámetro

    }

    async climaLugar(lat, lon) {
        try {
            
            // instance axios.create()
            const instance = await axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: {...this.paramsWeather, lat, lon}
            })

            // resp.data
            const { data } = await instance.get();

            const { main, weather } = data;

            const desc = weather[0].description;
            const { temp, temp_min, temp_max } = main;

            return {
                desc,
                min: temp_min,
                max: temp_max,
                temp: temp,
            }

        } catch (error) {
            console.log(error)
        }
    }

    agregarHistorial(lugar = ''){

        //TODO: prevenir duplicados
        // const existe = this.historial.find(l => l.toLocaleLowerCase() == lugar.toLocaleLowerCase());

        const existe = this.historial.includes(lugar.toLocaleLowerCase());
        if(existe) return;

        this.historial = this.historial.splice(0,5);

        this.historial.unshift(lugar.toLocaleLowerCase())
        

        // Grabar en DB
        this.guardarDB();

    }

    guardarDB(){

        const payload = {
            historial: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload));
    }

    leerDB(){
        
        // Debe de existir...
        if(fs.existsSync(this.dbPath)){
            // const info ... readFileSync ... path ... {encoding: 'utf-8}

            const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'})

            const data = JSON.parse(info);

            // const data = JSON.asd(info)

            this.historial = data.historial;
        }
        

    }

}

module.exports = Busquedas;