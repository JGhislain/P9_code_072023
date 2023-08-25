/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import {localStorageMock} from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event"
import router from "../app/Router.js";
	
jest.mock("../app/store", () => mockStore)

jest.spyOn(mockStore, "bills").mockImplementation(() => {
  return {
    create: jest.fn().mockResolvedValue({ status: 201 }),
    list: jest.fn().mockResolvedValue({ status: 200 }),
    update: jest.fn().mockResolvedValue({ status: 201 })
  }
});
	
describe("Je suis connecté comme un employé et quand je suis sur la page Nouvelle Note puis quand je soumet une nouvelle Note", () => {
	
	it("La note de frais est sauvegardée", async () => {
	// ---- Affichage du HTML de la page selon la navigation ---------------------------------
	const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
	}
//--------------------------------------------------------------------------------------//
//      Utilisation de l'objet 'Object' pour stocker des ensembles de clés/valeurs      //
//--------------------------------------------------------------------------------------//

	// ---- Ici on modifie sur l'objet 'window" la propriété 'localStorage' et on lui attribue la valeur 'localStorageMock' ----
	// ---- correspondant à la fonction simulée du localStorage ------------------------------
	Object.defineProperty(window, "localStorage", { value: localStorageMock })
	
	// ---- Dans le localStorage l'élément 'user' contient le type 'Employee' ----------------
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee"
	}))

	// ---- Le HTML affiché est celui de la page du formulaire de nouvelle note de frais -----

	const html = NewBillUI()
	document.body.innerHTML = html

	// ---- Création d'un objet NewBill ------------------------------------------------------
	const newBillInit = new NewBill({
	document, onNavigate, store: null, localStorage: window.localStorage
	})

	// ---- Récupération dans le DOM de l'élément formulaire d'une nouvelle note de frais ----
	const formNewBill = screen.getByTestId("form-new-bill")

	// ---- Vérification que l'élément de formulaire d'une nouvelle note de frais est bien trouvé en utilisant toBeTruthy ----
	expect(formNewBill).toBeTruthy()

	// ---- Création d'une fonction simulée avec 'jest.fn' de Jest pour simulée la fonction de gestion de la soumission ----
	// ---- d'une nouvelle note de frais qui est 'handleSubmit' ------------------------------
	const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e))

	
	// ---- Ajout sur l'élément de formulaire d'un evènement à la soumission déclenchant la fonction 'handleSubmit" ----
	formNewBill.addEventListener("submit", handleSubmit)

	// ---- fireEvent de testingLibrary permet de simuler la soumission du formulaire de nouvelle note de frais ----
	fireEvent.submit(formNewBill)


	// ---- Vérification que la fonction simulée de soumission d"une nouvelle note de frais a bien été appelée ----
	expect(handleSubmit).toHaveBeenCalled()
	});
	
	it("Vérification du fichier note de frais", async() => {


		// ---- Création d'une fonction simulée qui surveille également les appels de la méthode 'bills()' de l'objet mockStore ----
	jest.spyOn(mockStore, "bills")


	// ---- Affichage du HTML de la page selon la navigation ---------------------------------
	const onNavigate = (pathname) => {
	document.body.innerHTML = ROUTES({ pathname })
	} 

//--------------------------------------------------------------------------------------//
//      Utilisation de l'objet 'Object' pour stocker des ensembles de clés/valeurs      //
//--------------------------------------------------------------------------------------//


	// ---- Ici on modifie sur l'objet 'window" la propriété 'localStorage' et on lui attribue la valeur 'localStorageMock' ----
	// ---- correspondant à la fonction simulée du localStorage ------------------------------
	Object.defineProperty(window, "localStorage", { value: localStorageMock })

//--------------------------------------------------------------------------------------//
//      Utilisation de l'objet 'Object' pour stocker des ensembles de clés/valeurs      //
//--------------------------------------------------------------------------------------//

	// ---- Ici on modifie sur l'objet 'window" la propriété 'location' et on lui attribue sur la propriété 'hash' la valeur ----
	// ---- correspondant au chemin pour une nouvelle note de frais --------------------------
	Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })

	// ---- Dans le localStorage l'élément 'user' contient le type 'Employee' ----------------
	window.localStorage.setItem("user", JSON.stringify({
	type: "Employee"
	}))	

	// ---- Le HTML affiché est celui de la page du formulaire de nouvelle note de frais -----
	const html = NewBillUI()
	document.body.innerHTML = html

	// ---- Création d'un objet NewBill pour une nouvelle note de frais ----------------------
	const newBillInit = new NewBill({
	document, onNavigate, store: mockStore, localStorage: window.localStorage
	})

	// ---- Création d'un objet File contenant l'array image, s'appelant image.png et étant de type png ----
	const file = new File(['image'], 'image.png', {type: 'image/png'});

	// ---- Création d'une fonction simulée avec 'jest.fn' de Jest pour simulée la fonction de gestion de changement de fichier ----
	// ---- d'une nouvelle note de frais qui est 'handleChangeFile' --------------------------
	const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e))

	// ---- Récupération de l'élément du formulaire de nouvelle note de frais dans le DOM ----
	const formNewBill = screen.getByTestId("form-new-bill")

	// ---- Récupération dans le DOM de l'élément <input> de type file permettant de sélectionner un fichier ----
	const billFile = screen.getByTestId('file')

	// ---- Ajout d'un évènement sur le <input> de type file lors d'un changement de fichier avec appel de la fonction ----
	// ---- 'handleChangeFile' ---------------------------------------------------------------
	billFile.addEventListener("change", handleChangeFile);

	// ---- userEvent de testingLibrary permet de simuler le téléchargement de fichiers par un utilisateur, ici le fichier 'file' ----
	// ---- est chargé dans le <input> 'billFile' --------------------------------------------
	userEvent.upload(billFile, file)
	
	// ---- Vérification que le <input> a bien un fichier qui a été téléchargé, vérification que le fichier est bien défini ----
	expect(billFile.files[0].name).toBeDefined()

	// ---- Vérification que la fonction simulée 'handleChangeFile' a bien été appelée -------
	expect(handleChangeFile).toBeCalled()

	// ---- Création d'une fonction simulée avec 'jest.fn' de Jest pour simulée la fonction de gestion de la soumission du ----
	// ---- formulaire d'une nouvelle note de frais qui est 'handleSubmit' -------------------
	const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e))

	// ---- Ajout d'un évènement à la soumission sur le formulaire de nouvelle note de frais avec appel de la fonction ----
	// ---- 'handleSubmit' -------------------------------------------------------------------
	formNewBill.addEventListener("submit", handleSubmit)

	// ---- fireEvent de testingLibrary permet de simuler la soumission du formulaire de nouvelle note de frais ----
	fireEvent.submit(formNewBill)

	// ---- Vérification que la fonction simulée 'handleSubmit' a bien été appelée -----------
	expect(handleSubmit).toHaveBeenCalled()
	})
	
//--------------------------------------------------------------------------------------//
//                                Les erreurs 404 et 500                                //
//--------------------------------------------------------------------------------------//

	describe("Quand une erreur se produit sur l'API", () => {

		// ---- Utilisation de beforeEeach de Jest, pour exécuter un morceau de code pour chaque 'it' du bloc 'describe' ----
		beforeEach(() => {
		jest.spyOn(mockStore, "bills")
		Object.defineProperty(window, "localStorage", {
		value: localStorageMock,
		})
		window.localStorage.setItem(
			"user",
			JSON.stringify({
			type: "Employee",
			email: "a@a",
		})
		)
		const root = document.createElement("div")
		root.setAttribute("id", "root")
		document.body.appendChild(root)
		router()
	})
	
	it("Récupération des notes de frais de l'API et indication de l'échec avec un message d'erreur 404", async () => {
	mockStore.bills.mockImplementationOnce(() => {
	return {
	list: () => {
	return Promise.reject(new Error("Erreur 404"))
	},
	}
	})

	// ---- Le HTML affiché est celui de la page des notes de frais --------------------------
	window.onNavigate(ROUTES_PATH["Bills"])

	// ---- On attend la réponse de la promesse ----------------------------------------------
	await new Promise(process.nextTick)

	// ---- Récupération dans le DOM de la page de l'élément contenant 'Erreur 404' avec le screen de Testing library ----
	const message = await screen.getByText(/Erreur 404/)

	// ---- Vérification que le message d'erreur 'Erreur 404' est bien affiché sur la page (dans le DOM) avec toBeTruthy ----
	expect(message).toBeTruthy()
	});
	
	it("Récupération des notes de frais de l'API et indication de l'échec avec un message d'erreur 500", async () => {
	mockStore.bills.mockImplementationOnce(() => {
	return {
	list: () => {
	return Promise.reject(new Error("Erreur 500"))
	},
	}
	})
	window.onNavigate(ROUTES_PATH["Bills"])
	await new Promise(process.nextTick)
	const message = await screen.getByText(/Erreur 500/)
	expect(message).toBeTruthy()
	})
	})
})

// --------------------------------------------------------------------------------------//
//            Test de la réponse de l'API lors de la mise à jour d'une note              //
// --------------------------------------------------------------------------------------//

describe("Lorsque j'envoie un nouveau fichier NewBill", () => {
	// Description du test unitaire
	test("J'envoie NewBill depuis le mock de l'API mocké", async () => {
		// Initialisation des données mockées
		let mockBillsList = [
			//(deux objets "bill" initiaux ici)
			{
			email: "employee@test.tld",
			type: "Restaurant",
			name: "Dinner",
			amount: "100",
			date: "2023-08-01",
			vat: "20",
			pct: "30",
			commentary: "dinner de travail",
			fileUrl: "http://localhost:8080/images/test1.jpg",
			fileName: "test1.jpg",
			status: "pending"
			},
			{
			email: "employee@test.tld",
			type: "Transport",
			name: "Uber",
			amount: "50",
			date: "2023-08-02",
			vat: "10",
			pct: "15",
			commentary: "Uber vers aéroport",
			fileUrl: "http://localhost:8080/images/test2.jpg",
			fileName: "test2.jpg",
			status: "pending"
			},
		];

		// Espionnage et "mocking" du store pour simuler le comportement des méthodes 'list' et 'create'
		jest.spyOn(mockStore, "bills").mockImplementation(() => ({
			list: async () => mockBillsList,
			create: async (newBill) => {
			mockBillsList.push(newBill);
			}
		}));
		
		// Vérifier les données initiales
		const initialBillsList = await mockStore.bills().list();
		expect(initialBillsList.length).toBe(2);


		// Créer un nouveau "bill"
		let bill = {
			email: "employee@test.tld",
			type: "Transport",
			name: "Vol bliblablou",
			amount: "153",
			date: "2023-08-25",
			vat: "10",
			pct: "10",
			commentary: "un test",
			fileUrl: "http://127.0.0.1:8080/images/test.jpg",
			fileName: "test.jpg",
			status: "pending"
			};

		// Appeler la méthode 'create' du mockStore pour ajouter le nouveau "bill"
		mockStore.bills().create(bill);
		// Attendre que la longueur de la liste de "bills" soit de 3 (2 initiaux + 1 nouveau)
		waitFor(() => expect(billsList.length).toBe(3));
	});
});
