import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
 constructor({ document, onNavigate, store, localStorage }) {
 this.document = document
 this.onNavigate = onNavigate
 this.store = store
 const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`) // Sélection du formulaire de nouvelle note de frais
 formNewBill.addEventListener("submit", this.handleSubmit)
 const file = this.document.querySelector(`input[data-testid="file"]`) //Selection de l'input de selection d'un fichier
 file.addEventListener("change", this.handleChangeFile) // La fonction handleChangeFile est appelé lordque l'utilisateur change le fichier de justificatif de note de frais
 this.fileUrl = null
 this.fileName = null
 this.billId = null
 new Logout({ document, localStorage, onNavigate })
 }
 handleChangeFile = e => {
 e.preventDefault()
 const file = this.document.querySelector(`input[data-testid="file"]`).files[0] // Permet de récupérer le premier fichier choisit par l'utilisateur avec l'input
 // file est objet de type File possédant une propriété File.type
 const filePath = e.target.value.split(/\\/g) // récupère le chemin du fichier en le stockant dans le tableau filePath à chaque fois qu'une séparateur \ est trouvé
 const fileName = filePath[filePath.length-1] // On récupère le nom du fichier choisit par l'utilisateur
 //Correction bug extension jpg / jpeg / png -------------
 const extensionsAutorisees = /jpg|jpeg|png$/i.test(file.type ? file.type : fileName); 
 // extensionsAutorisees est une constante permettant de stocker un booléen pour savoir si le fichier est de type jpg ou jpeg ou png
 // Si le type de fichier existe alors on test l'expression régulière sur le type de fichier sinon on teste l'expression
 // régulière sur le nom du fichier. La méthode test() renvoi true si l'espression réguilère est trouvée dans la chaine du
 // type de fichier (filetype).
 //----------------------------------------------------------------------------
 const formData = new FormData() // Création d'un objet FormData pour envoyer le formulaire HTML avec ou sans fichier
 const email = JSON.parse(localStorage.getItem("user")).email // JSON.parse permet de convertir l'objet JSON en objet, ici on récupère l'email du user du localStorage
 formData.append('file', file) //ajoute un champ de formulaire avec le nom valant 'file' et la valeur valant file
 formData.append('email', email)

 // 
 /* this.store
 .bills() retourne les données mockedBills
 .create({ Permet de crée la note de frais avec les données contenant l'objet formData, qui contient le fichier choisit par l'utilisateur
 data: formData,
 headers: {
 noContentType: true
 }
 })
 .then(({fileUrl, key}) => {
 console.log(fileUrl)
 this.billId = key
 this.fileUrl = fileUrl
 this.fileName = fileName
 }).catch(error => console.error(error))
 }*/
 //

//Correction bug extension jpg / jpeg / png -------------
if (extensionsAutorisees) { // Si l'extension du fichier est jpg ou jpeg ou png alors on autorise la création de la note de frais 
 this.store
 .bills() //retourne les données mockedBills
 .create({ //Permet de crée la note de frais avec les données contenant l'objet formData, qui contient le fichier choisit par l'utilisateur
 data: formData,
 headers: {
 noContentType: true
 }
 })
 .then(({fileUrl, key}) => {
 console.log(fileUrl)
 this.billId = key
 this.fileUrl = fileUrl
 this.fileName = fileName
 }).catch(error => console.error(error))
} else { // Si l'extension du fichier est différente de jpg ou jpeg ou png
 alert('Le justificatif sélectionné doit être au format jpg, jpeg ou png')
 this.document.querySelector(`input[data-testid="file"]`).value = ""; // la valeur de l'input d'insertion du fichier est réinitialisé avec une chaine vide car le format du fichier sélectionné était non autorisé
}
}
//--------------------------------------------------

 handleSubmit = e => {
 e.preventDefault()
 console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
 const email = JSON.parse(localStorage.getItem("user")).email
 const bill = {
 email,
 type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
 name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
 amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
 date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
 vat: e.target.querySelector(`input[data-testid="vat"]`).value,
 pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
 commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
 fileUrl: this.fileUrl,
 fileName: this.fileName,
 status: 'pending'
 }
 this.updateBill(bill)
 this.onNavigate(ROUTES_PATH['Bills'])
 }

 // not need to cover this function by tests
 updateBill = (bill) => {
 if (this.store) {
 this.store
 .bills()
 .update({data: JSON.stringify(bill), selector: this.billId})
 .then(() => {
 this.onNavigate(ROUTES_PATH['Bills'])
 })
 .catch(error => console.error(error))
 }
 }
}