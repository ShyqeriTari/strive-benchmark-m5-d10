import PdfPrinter from "pdfmake"

export const getPDFstream = (header, text, reviews, imageUrl) => {

   const fonts = {
        Helvetica: {
          normal: 'Helvetica',
          bold: 'Helvetica-Bold',
        }
      };
      
     const printer = new PdfPrinter(fonts);
      
    const docDefinition = {

            content: [
        
                {
                    image: imageUrl,
                    fit: [520, 520]
                },
                {
                    text: header + " - " + text,
                    style: 'header',
                    
                },
                {
                    text: "Reviews:",
                    style: 'header2',
                    
                },
                reviews,
            ],

            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0,8]
                },
                header2: {
                    fontSize: 14,
                    bold: true,
                    margin: [0,6]
                }
            
        },
        defaultStyle:{
            font: "Helvetica"
        }
        
      };
      
      
     const pdfStream = printer.createPdfKitDocument(docDefinition, {});
    
      pdfStream.end()
    return pdfStream

}