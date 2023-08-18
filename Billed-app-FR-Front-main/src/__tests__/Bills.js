/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES,ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import "@testing-library/jest-dom";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
	
jest.mock("../app/store", () => mockStore)
	
describe("Je suis connecté en tant qu'employé", () => {

	describe("Quand je suis sur la page des notes de frais", () => {

	it("L'icône de note de frais dans la mise en page vertical devrait être mis en valeur", async () => {
	Object.defineProperty(window, 'localStorage', { value: localStorageMock })
	window.localStorage.setItem('user', JSON.stringify({
	type: 'Employee'
	}))
	const root = document.createElement("div")
	root.setAttribute("id", "root")
	document.body.append(root)
	router()
	window.onNavigate(ROUTES_PATH.Bills)
	await waitFor(() => screen.getByTestId('icon-window'))
	const windowIcon = screen.getByTestId('icon-window')
	//Ajout du test unitaire : il manque la mention 'expect'
	// L'icône windows affiché en valeur sur la page doit avoir la classe 'active-icon'
	// Dans Router.js, on a la classe 'active-icon' ajoutée à la <div> contenant l'icône Windows (la <div> dans le 
	// fichier VerticalLayout.js)
	expect(windowIcon).toHaveClass('active-icon')
	//-----------------------------------------------------	
	})

	it("Les notes de frais doivent être triées de la plus récente à la plus ancienne", () => {
	// Correction du test unitaire sur l'affichage par ordre décroissant des notes de frais
	// Envoi à l'interface utilisateur des notes de frais triées à affichées
	// 'data' représente les données mockées/simulées se trouvant dans la constante 'mockedBills' de store.js
	document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => (a.date < b.date) ? 1 : -1) })
	// Utilisation de 'screen' pour faire une requete testing Library sur document.body
	// Le matcher 'getAllByText' permet de trouver une correspondance textuel dans les éléments du DOM sur le 'screen'
	// par rapport à l'expression régulière fournit en argument du matcher qui signifie que ce matcher va récupérer tout
	// les éléments de date de le DOM ayant le format 'YYYY-MM-DD'
	const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
	const datesSorted = [ '2004-04-04', '2003-03-03', '2002-02-02', '2001-01-01' ]
	// Les dates récupérer avec screen et getAllByText doivent correspondre aux dates triées du tableau datesSorted
	expect(dates).toEqual(datesSorted)
	})
	})
	
	describe("Quand je clique sur Nouvelle note de frais", () => {

	it("Le formulaire pour créer une nouvelle note de frais apparaît", async () => {
	// Affichage du HTML de la page selon la navigation
	const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
	}
	// Utilisation de l'objet 'Object' pour stocker des ensembles de clés/valeurs
	// Ici on modifie sur l'objet 'window" la propriété 'localStorage' et on lui attribue la valeur 'localStorageMock'
	// correspondant à la fonction simulée du localStorage
	Object.defineProperty(window, "localStorage", { value: localStorageMock })
	// Dans la localStorage l'élément 'user' contient le type 'Employee' 
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee"
	}))
	// Création d'un objet Bills
	const billsInit = new Bills({
	document, onNavigate, store: null, localStorage: window.localStorage
	})
	// Le HTML affiché est celui de la page d'affichage de la liste des notes de frais
	document.body.innerHTML = BillsUI({ data: bills })
	// Création d'une fonction simulée avec 'jest.fn' de Jest pour simulée la fonction de gestion du click
	// d'une nouvelle note de frais qui est 'handleClickNewBill'
	const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill ())
	//Récupération du bouton 'Nouvelle note de frais'
	const btnNewBill = screen.getByTestId("btn-new-bill")
	// Evenement au clic sur le bouton "Nouvelle note de frais"
	btnNewBill.addEventListener("click", handleClickNewBill)
	// userEvent de testingLibrary permet de simuler le click sur le bouton
	userEvent.click(btnNewBill)
	// Vérification que la fonction simulée à bien été appelée
	expect(handleClickNewBill).toHaveBeenCalled()
	//Récupération avec screen de TestingLibrary du formulaire de la page de saisie d'une nouvelle note de frais
	await waitFor(() => screen.getByTestId("form-new-bill"))
	// Vérification que le formulaire est bien récupéré, 'toBeTruthy' permet de savoir si la valeur est à true 
	expect(screen.getByTestId("form-new-bill")).toBeTruthy()
	})
	})
	
	describe("Quand je clique sur l'oeil dans la note de frais", () => {

	it("La fenêtre modale doit apparaitre", async () => {
	const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
	}
	Object.defineProperty(window, "localStorage", { value: localStorageMock })
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee"
	}))
	const billsInit = new Bills({
	document, onNavigate, store: null, localStorage: window.localStorage
	})
	document.body.innerHTML = BillsUI({ data: bills })
	// Création d'une fonction simulée avec 'jest.fn' de Jest pour simulée la fonction de gestion du click
	// sur l'oeil d'une nouvelle note de frais qui est 'handleClickIconEye'
	const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon));
	// Récupération des icones des yeux par rapport à l'id 'data-testid="icon-eye"' avec screen
	const iconEye = screen.getAllByTestId("icon-eye");
	// Récupération de la fenêtre de modale en utilisant son id 'modaleFile',voir BillsUI.js
	const modaleFile = document.getElementById("modaleFile")
	// Création d'une fonction simulée permettant d'ajouter la class 'show' à la fenêtre de modale
	$.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
	// Boucle pour traitée chaque icone d'oeil
	iconEye.forEach((icon) => {
	// Ajout d'un évenement au clic sur l'icone oeil
	icon.addEventListener("click", handleClickIconEye(icon))
	// userEvent de testingLibrary permet de simuler le click sur l'icon
	userEvent.click(icon)
	// Vérification que la fonction simulée à bien été appelée
	expect(handleClickIconEye).toHaveBeenCalled()
	})
	// Vérification que la fenêtre de modale contient bien la classe 'show' car elle a bien été appelée 
	expect(modaleFile).toHaveClass("show")
	})
	})
	
	describe("Quand je navige au niveau des notes de frais", () => {

	it("Récupération des notes de frais depuis l'API mock GET", async () => {
	const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
	}
	Object.defineProperty(window, "localStorage", { value: localStorageMock })
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee"
	}))
	new Bills({
	document, onNavigate, store: null, localStorage: window.localStorage
	}) 
	// Le HTML affiché est celui de la page de la liste des notes de frais
	document.body.innerHTML = BillsUI({ data: bills })
	// On attend pour récupérer l'élément contenant "Mes notes de frais" sur la page grâce à screen
	await waitFor(() => screen.getByText("Mes notes de frais"))
	// Vérification de l'élément contenant 'Mes notes de frais' est bien trouvé sur la page, toBeTruthy est à true
	expect(screen.getByText("Mes notes de frais")).toBeTruthy()
	})
	})
	
	describe("Quand une erreur se produit sur l'API", () => {

	// Utilisation de beforeEeach de Jest, pour exécuter un morceau de code pour chaque 'it' du bloc 'describe' 
	beforeEach(() => {
	// Création d'une fonction simulée qui surveille également les appels de la méthode 'bills()' de l'objet mockStore
	jest.spyOn(mockStore, "bills")
	// Utilisation de l'objet 'Object' pour stocker des ensembles de clés/valeurs
	// Ici on modifie sur l'objet 'window" la propriété 'localStorage' et on lui attribue la valeur 'localStorageMock'
	// correspondant à la fonction simulée du localStorage
	Object.defineProperty(
	window,
	"localStorage",
	{ value: localStorageMock }
	)
	// Dans la localStorage l'élément 'user' contient le type 'Employee' et l'email 'a@a'
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee",
	email: "a@a"
	}))
	const root = document.createElement("div")
	root.setAttribute("id", "root") // la <div> root a un id valant root (id=root)
	document.body.appendChild(root) // Ajout de l'élément de DOM root dans le body du DOM
	router() // Appel de la fonction router() depuis Router.js pour gérer la navigation et les différents chemins
	})
	
	// Erreur 404: Ressource non trouvée
	it("Récupération des notes de frais sur l'API et indication de l'échec avec un message d'erreur 404", async () => {
	// Première implémentation de la fonction simulée 'mockStore'
	mockStore.bills.mockImplementationOnce(() => {
	return {
	list : () => {
	// La méthode reject() renvoi un objet Promise qui est rompue avec l'erreur étant l'erreur 404
	return Promise.reject(new Error("Erreur 404")) 
	}
	}})
	// Stockage dans la constant html du html renvoyer par la fonction BillsUI (contient le html de la page où
	//sont listées les notes de frais) avec l'erreur 404 en paramètre
	const html = BillsUI({ error: "Erreur 404" })
	// Le HTML affiché est celui de la constante html
	document.body.innerHTML = html
	// Récupération dans le DOM de la page de l'élément contenant 'Erreur 404' avec le screen de Testing library
	const message = await screen.getByText(/Erreur 404/)
	// Vérification que le message d'erreur 'Erreur 404' est bien affiché sur la page (dans le DOM) avec toBeTruthy
	expect(message).toBeTruthy()
	})

	// Erreur 500 : erreur interne du serveur
	it("Récupération des notes de frais sur l'API et indication de l'échec avec un message d'erreur 500", async () => {
	mockStore.bills.mockImplementationOnce(() => {
	return {
	list : () => {
	// La méthode reject() renvoi un objet Promise qui est rompue avec l'erreur étant l'erreur 500
	return Promise.reject(new Error("Erreur 500"))
	}
	}})
	const html = BillsUI({ error: "Erreur 500" })
	document.body.innerHTML = html
	// Récupération dans le DOM de la page de l'élément contenant 'Erreur 500' avec le screen de Testing library
	const message = await screen.getByText(/Erreur 500/)
	// Vérification que le message d'erreur 'Erreur 500' est bien affiché sur la page (dans le DOM) avec toBeTruthy
	expect(message).toBeTruthy()
	})
	})
})
