const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require("dotenv").config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')
const path = require("path")
const fs = require("fs")
const chat = require("./chatGPT")

const menuPath = path.join(__dirname, "mensajes", "menu.txt")
const menu = fs.readFileSync(menuPath, "utf-8")

const pathConsultas = path.join(__dirname, "mensajes", "propmptConsultas.txt")
const propmptConsultas = fs.readFileSync(pathConsultas, "utf-8")


const flowMenuRest = addKeyword(EVENTS.ACTION)
    .addAnswer('Este es el menu:',{
        media: "https://landing.bubbagump.mx/wp-content/uploads/2024/10/Menus-Completos-Posadas-2024-Bubba-Gump.pdf"
    })
    .addAnswer("Para volver a iniciar el bot escribe 'Inicio'")


const flowReservar = addKeyword(EVENTS.ACTION)
    .addAnswer('sigue este enlace para realizar tu reserva: https://www.opentable.com.mx/restref/client/?rid=64162&restref=64162&lang=es-MX&color=1&r3uid=cfe&dark=false&ot_source=Web-ES&ot_campaign=Web-Encabezado&corrid=2cad308c-9edb-4305-947a-f6edb240f992')
    .addAnswer("Para volver a iniciar el bot escribe 'Inicio'")

const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer("¡Por el momento la API de ChatGPT no tiene saldo, lo sentimos! Si tienes dudas o requieres asistencia llama a este número: 998 100 3497.  Para volver a iniciar el bot, escribe 'Inicio'", {capture:true}, async(ctx,ctxFn) => {
        const prompt = propmptConsultas
        const consulta = ctx.body
        const answer = await chat (prompt,consulta)
        await ctxFn.flowDynamic(answer.content)

        
    })
    
 
const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("¡Bienvenido a Bubba Gump!", {
        delay: 100,
        media:"https://www.lugaresaccesibles.com/images/place/f132b7827a3d297880557c9e9636e062.jpg"
    })
    .addAnswer("Para dar seguimiento a la asistencia escribe 'Inicio'")

const menuFlow = addKeyword(['Inicio', 'inicio']).addAnswer(
    menu,
    {capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!["1","2","3","0"].includes(ctx.body)){
            return fallBack("Respuesta no válida, por favor selecciona una de las opciones."

            );
        }
        switch(ctx.body){
            case "1":
                return gotoFlow(flowMenuRest);
            case "2":
                return gotoFlow(flowReservar);
            case "3":
                return gotoFlow(flowConsultas);
            case "0":
                return await flowDynamic(
                    "Saliendo... Puedes volver a acceder a este menú escribiendo 'Inicio'"
                );
        }

    }

)

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowWelcome, menuFlow, flowConsultas, flowMenuRest, flowReservar])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
