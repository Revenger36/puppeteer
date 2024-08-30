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
//


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
        const page2 = await browser.newPage();
        try {
            // Attempt to navigate to the page
            await page2.goto(link.link, {
                waitUntil: "domcontentloaded"
            });

            // Extract specific data from the page
            const programacaoData = await page2.evaluate(() => {
                // Example of extracting multiple types of data
                const titles = document.querySelector('.post-title').textContent.trim();
                const dates = document.querySelector('.data-local svg').nextSibling.textContent.trim();
                const local = document.querySelector('div.col-md-5.textos .item')?.querySelector('span')?.innerText || null;
                const valor = document.querySelector('div.col-md-5.textos [class="notice__excerpt_inner"]')?.querySelector('strong')?.textContent || null;

                return {
                    titulo: titles || 'Sem Titulo',
                    data: dates || 'Sem Data',
                    local: local || 'Sem Local',
                    valor: valor || 'Sem Valor'
                };
            });

            // Log the extracted data
            console.log(`Data from ${link.link}:`, programacaoData);

        } catch (error) {
            // Handle errors during page navigation or evaluation
            console.error(`Failed to load ${link.link}:`, error);
        } finally {
            // Close the page
            await page2.close();
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