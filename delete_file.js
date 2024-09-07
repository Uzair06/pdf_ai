import fs from 'fs'

const delete_file = async(contentType, from)=>{

    if(contentType === 'application/pdf'){
      fs.unlink(`${from}.pdf`, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('File deleted successfully')
      })
    }
    else if(contentType === 'image/jpeg'){
      fs.unlink(`${from}.jpeg`, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('File deleted successfully')
      })
    }
    else if(contentType === 'image/png'){
      fs.unlink(`${from}.png`, (err) => {
        if (err) {
          console.error(err)
          return
        }
        console.log('File deleted successfully')
      })
    }

}

export default delete_file