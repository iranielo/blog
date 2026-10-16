const postForm = document.querySelector("#post-form");
const imageInput = document.querySelector("#post-image-input");
const captionInput = document.querySelector("#post-caption-input");
const postsList = document.querySelector("#posts-list");
const storageKey = "blog-da-irani-posts";
let posts = carregarPublicacoes();

function carregarPublicacoes() {
	try {
		return JSON.parse(localStorage.getItem(storageKey)) || [];
	} catch (error) {
		return [];
	}
}

function salvarPublicacoes() {
	try {
		localStorage.setItem(storageKey, JSON.stringify(posts));
		return true;
	} catch (error) {
		alert("Não foi possível salvar. Tente usar uma imagem menor.");
		return false;
	}
}

function criarElemento(tag, className, text) {
	const elemento = document.createElement(tag);
	if (className) elemento.className = className;
	if (text) elemento.textContent = text;
	return elemento;
}

function mostrarPublicacoes() {
	postsList.replaceChildren();

	if (posts.length === 0) {
		postsList.append(criarElemento("p", "empty-message", "Ainda não há publicações. Seja a primeira pessoa a postar uma foto!"));
		return;
	}

	posts.forEach(function (post) {
		const postElement = criarElemento("article", "post");
		const date = new Date(post.date).toLocaleString("pt-BR");
		const dateElement = criarElemento("p", "post-date", date);
		const image = document.createElement("img");
		image.className = "post-image";
		image.src = post.image;
		image.alt = post.caption || "Imagem da publicação";
		const caption = criarElemento("p", "post-caption", post.caption);
		const commentsSection = criarElemento("div", "comments");
		const commentsTitle = criarElemento("h3", "", "Comentários (" + post.comments.length + ")");
		const commentsList = document.createElement("div");

		post.comments.forEach(function (comment) {
			commentsList.append(criarElemento("p", "comment", comment.name + ": " + comment.text));
		});

		const commentForm = document.createElement("form");
		commentForm.className = "comment-form";
		const nameInput = document.createElement("input");
		nameInput.type = "text";
		nameInput.placeholder = "Seu nome";
		nameInput.setAttribute("aria-label", "Seu nome");
		nameInput.maxLength = 40;
		nameInput.required = true;
		const commentInput = document.createElement("input");
		commentInput.type = "text";
		commentInput.placeholder = "Escreva um comentário";
		commentInput.setAttribute("aria-label", "Escreva um comentário");
		commentInput.maxLength = 300;
		commentInput.required = true;
		const commentButton = document.createElement("button");
		commentButton.type = "submit";
		commentButton.textContent = "Comentar";

		commentForm.append(nameInput, commentInput, commentButton);
		commentForm.addEventListener("submit", function (event) {
			event.preventDefault();
			post.comments.push({
				name: nameInput.value.trim(),
				text: commentInput.value.trim()
			});

			if (salvarPublicacoes()) mostrarPublicacoes();
		});

		commentsSection.append(commentsTitle, commentsList, commentForm);
		postElement.append(dateElement, image, caption, commentsSection);
		postsList.append(postElement);
	});
}

postForm.addEventListener("submit", function (event) {
	event.preventDefault();
	const file = imageInput.files[0];

	if (!file || !file.type.startsWith("image/")) {
		alert("Escolha um arquivo de imagem para publicar.");
		return;
	}

	if (file.size > 3 * 1024 * 1024) {
		alert("Escolha uma imagem menor que 3 MB.");
		return;
	}

	const reader = new FileReader();
	reader.addEventListener("load", function () {
		posts.unshift({
			image: reader.result,
			caption: captionInput.value.trim(),
			date: new Date().toISOString(),
			comments: []
		});

		if (salvarPublicacoes()) {
			postForm.reset();
			mostrarPublicacoes();
		} else {
			posts.shift();
		}
	});
	reader.readAsDataURL(file);
});

mostrarPublicacoes();