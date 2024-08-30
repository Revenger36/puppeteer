import puppeteer from "puppeteer";
import pkg from 'pg';
const { Pool } = pkg;


const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "scrapper",
    password: "0000",
    port: 5432,
});



const getQuotes = async () => {

    const client = await pool.connect().catch(() => {
        console.log("deu erro na conexão")
    })



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
    await page.waitForSelector('div.load-more-programacao[style="display: none;"]') //espera o carregar mais sumir

    const links = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('.programacao'))
        return links.map(link => {
            const cardsThumb = link.querySelector('.notice__thumb')
            return {
                link: cardsThumb.getAttribute('href'),
            }
        })
    })


    const programacaoDataArray = []

    for (const link of links) {
        const page2 = await browser.newPage();
        try {

            await page2.goto(link.link, {
                waitUntil: "domcontentloaded"
            });


            const programacaoData = await page2.evaluate(() => {

                const titles = document.querySelector('.post-title').textContent.trim();
                const dates = document.querySelector('.data-local svg').nextSibling.textContent.trim();
                const dados = document?.querySelectorAll('div.col-md-5.textos .item') || null;
                const valor = document.querySelector('div.col-md-5.textos [class="notice__excerpt_inner"]')?.querySelector('strong')?.textContent || null; const descricao = document?.querySelector('.descricao').textContent || null;

                function tratarValor(val) {
                    if (val === null) {
                        return val
                    } else {
                        let value = val.replace('R$ ', '').replace('.', '').replace(',', '.')
                        return value
                    }

                }
                const valorTratado = tratarValor(valor)

                function cleanContent(content) {
                    let cleaned = content.trim();
                    cleaned = cleaned.replace(/\n+/g, ' ');
                    cleaned = cleaned.replace(/\s{2,}/g, ' ');
                    return cleaned;
                }
                const dataTratada = cleanContent(dates ? dates : null)
                const descricaoTratado = cleanContent(descricao ? descricao : null)

                return {
                    titulo: titles || 'Sem Titulo',
                    data: dataTratada || 'Sem Data',
                    local: dados[0]?.querySelector('span')?.textContent || 'Sem Local',
                    classificacao: dados[1]?.querySelector('span')?.textContent || 'Sem classificacao',
                    duracao: dados[2]?.querySelector('span')?.textContent || 'Sem duracao',
                    valor: 'R$ ' + valorTratado || 'Sem Valor',
                    descricao: descricaoTratado ? descricaoTratado : 'Sem descricao'
                };
            });
            programacaoData.link = link.link;
            programacaoDataArray.push(programacaoData)
            console.log(`Data from ${link.link}:`, programacaoData);

        } catch (error) {

            console.error(`Failed to load ${link.link}:`, error);
        } finally {

            await page2.close();
        }
    }

    console.log("foi?")

    for (const data of programacaoDataArray) {
        try {
            await client.query(
                "INSERT INTO scrap (title, data, location, classification, duration, value, description, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                [data.titulo, data.data, data.local, data.classificacao, data.duracao, data.valor, data.descricao, data.link]
            );
        } catch (error) {
            console.error("DEU RUIM NA QUERY TIO:", error);
        }
    }

    client.end()




};
getQuotes()