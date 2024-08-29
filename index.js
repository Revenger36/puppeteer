import puppeteer from "puppeteer";
// import pkg from 'pg';
// const { Pool } = pkg;


// const pool = new Pool({
//     user: "postgres",
//     host: "localhost",
//     database: "scrapper",
//     password: "0000",
//     port: 5432,
// });



const getQuotes = async () => {

    // const client = await pool.connect().catch(() => {
    //     console.log("deu erro na conexão")
    // })



    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto("https://sescmg.com.br/", {
        waitUntil: "domcontentloaded",
    });


    await page.waitForSelector('.dialog-lightbox-message') //espera o banner
    await page.keyboard.press('Escape') // fecha o banner
    await page.locator('.load-more-programacao').wait() // espera o carregar mais
    await page.click('.load-more-programacao') // clicar no botão +
    await page.waitForSelector('div.load-more-programacao[style="display: none;"]')
    // await page.waitForFunction(() => {
    //     const element = document.querySelector('.load-more-programacao');
    //     // Return true if the element is not displayed (style display: none) or any other condition you need
    //     return element && window.getComputedStyle(element).display !== 'none';
    // });
    // await page.locator('.notice__title').wait()


    const links = await page.evaluate(() => {

        const links = Array.from(document.querySelectorAll('.programacao'))
        // const test = document.querySelector('.load-more-programacao')

        return links.map(link => {
            // return test ? test.getAttribute('style') : null;
            const cardsThumb = link.querySelector('.notice__thumb')
            // const cardsThumb2 = link.querySelector('.notice__title')

            return {
                link: cardsThumb.getAttribute('href'),
                // link2: cardsThumb2.getAttribute('href')
            }

        })

    })


    for (const link of links) {
        const page2 = await browser.newPage()
        try {await page2.goto(link.link, {
            waitUntil: "domcontentloaded"
            
        });
        } catch {
            console.log("link aberto")
            
    const programacaoData = await page2.evaluate(() => {
        const programacao = Array.from(document.querySelectorAll('.programacao'));
        return programacao.map(prog => {
            const title = prog.querySelector('.post-title').textContent;
            const cardsDate = prog.querySelector('.data-local svg').nextSibling.textContent.trim()
            // const valor = prog.querySelector('.notice__excerpt_inner strong')?.textContent
            return {
                titulo: title,
                data: cardsDate.replace((/\s+/g, ' ').trim())
                // valor: valor
            };
        });
    });
    console.log(programacaoData)
        
        }finally {
            // console.log(link.link)
            await page2.close()
        }
    }
    
    // links.forEach(async (a,b) =>{
    //     console.log(a.link)
        
    //     await page2.goto(a.link, {
    //         waitUntil: "domcontentloaded",
    //     });
    // })
    // console.log(links)





    console.log("foi?")




    // const programacaoData = await page.evaluate(() => {

    //     const programacao = Array.from(document.querySelectorAll('.programacao'));



    //     return programacao.map(prog => {

    //         const cardsThumb = prog.querySelector('.notice__thumb');
    //         const cardsDate = prog.querySelector('svg.feather-map-pin')?.nextSibling.textContent.trim()
    //         const valor = prog.querySelector('.notice__excerpt_inner strong')?.textContent


    //         return {
    //             link: cardsThumb.getAttribute('href'),
    //             text: cardsThumb.textContent.trim(),
    //             data: cardsDate,
    //             valor: valor
    //         };
    //     });
    // });
    // console.log(programacaoData)

    // programacaoData.forEach(async function (a, b) {
    //     client.query("INSERT INTO scrap (link, text, data, value) VALUES ($1, $2, $3, $4)", [a.link, a.text, a.data, a.valor]).catch(() => {
    //         console.error("deu ruim")
    //     })
    // })

    // await page.waitForTimeout(5000)


    // client.end()




    };
getQuotes()