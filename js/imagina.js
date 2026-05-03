document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const notesLayer = document.getElementById("notes-layer");
    const addNoteBtn = document.getElementById("addNote");
    const colorPicker = document.getElementById("colorPicker");
    const toolButtons = document.querySelectorAll("[data-tool]");
    const drawingTools = ["pencil", "eraser", "rect", "circle", "line"];

    let tool = "pencil";
    let drawing = false;
    let startX = 0;
    let startY = 0;
    let snapshot = null;
    let color = colorPicker.value || "#000000";

    function saveCanvasToStorage() {
        const canvasData = canvas.toDataURL();
        localStorage.setItem('pizarraCanvas', canvasData);
    }

    function loadCanvasFromStorage() {
        const canvasData = localStorage.getItem('pizarraCanvas');
        if (canvasData) {
            const image = new Image();
            image.onload = () => {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            };
            image.src = canvasData;
        }
    }

    function saveNotesToStorage() {
        const notes = [];
        document.querySelectorAll('.note').forEach(note => {
            notes.push({
                left: note.style.left,
                top: note.style.top,
                text: note.querySelector('.note-body').textContent
            });
        });
        localStorage.setItem('pizarraNotes', JSON.stringify(notes));
    }

    function loadNotesFromStorage() {
        const notesData = localStorage.getItem('pizarraNotes');
        if (notesData) {
            const notes = JSON.parse(notesData);
            notes.forEach(noteData => {
                const note = document.createElement('div');
                note.className = 'note';
                note.style.left = noteData.left;
                note.style.top = noteData.top;

                const del = document.createElement('div');
                del.className = 'delete-btn';
                del.textContent = '✕';
                del.addEventListener('click', () => {
                    note.remove();
                    saveNotesToStorage();
                });

                const content = document.createElement('div');
                content.className = 'note-body';
                content.contentEditable = 'true';
                content.textContent = noteData.text;

                note.appendChild(del);
                note.appendChild(content);
                notesLayer.appendChild(note);
                makeDraggable(note);
            });
        }
    }

    function showWelcomeIfFirstVisit() {
        if (!localStorage.getItem('pizarraVisitado')) {
            localStorage.setItem('pizarraVisitado', 'true');
            const popupBienvenida = new bootstrap.Modal(document.getElementById('popupBienvenida'));
            popupBienvenida.show();
        }
    }

    function showTutorial() {
        const popupBienvenida = new bootstrap.Modal(document.getElementById('popupBienvenida'));
        popupBienvenida.show();
    }

    const helpButton = document.getElementById('helpButton');
    if (helpButton) {
        helpButton.addEventListener('click', showTutorial);
    }

    function resizeCanvas() {
        const currentImage = canvas.toDataURL();
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        if (currentImage && currentImage !== 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==') {
            const image = new Image();
            image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            image.src = currentImage;
        }
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    loadCanvasFromStorage();
    loadNotesFromStorage();
    showWelcomeIfFirstVisit();

    toolButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            tool = btn.dataset.tool;
            toolButtons.forEach(button => button.classList.remove("active"));
            btn.classList.add("active");
            canvas.style.cursor = drawingTools.includes(tool) ? "crosshair" : "default";
        });
    });

    colorPicker.addEventListener("input", (e) => {
        color = e.target.value;
    });

    const undoButton = document.getElementById("undoButton");
    const redoButton = document.getElementById("redoButton");
    const clearCanvas = document.getElementById("clearCanvas");

    const undoStack = [];
    const redoStack = [];
    const maxStack = 25;

    function updateHistoryButtons() {
        undoButton.disabled = undoStack.length === 0;
        redoButton.disabled = redoStack.length === 0;
    }

    function restoreState(dataUrl) {
        const image = new Image();
        image.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
        image.src = dataUrl;
    }

    function pushState() {
        if (undoStack.length >= maxStack) {
            undoStack.shift();
        }
        undoStack.push(canvas.toDataURL());
        redoStack.length = 0;
        updateHistoryButtons();
    }

    updateHistoryButtons();

    undoButton.addEventListener("click", () => {
        if (undoStack.length === 0) return;
        redoStack.push(canvas.toDataURL());
        const previous = undoStack.pop();
        restoreState(previous);
        saveCanvasToStorage();
        updateHistoryButtons();
    });

    redoButton.addEventListener("click", () => {
        if (redoStack.length === 0) return;
        undoStack.push(canvas.toDataURL());
        const next = redoStack.pop();
        restoreState(next);
        saveCanvasToStorage();
        updateHistoryButtons();
    });

    canvas.addEventListener("mousedown", (e) => {
        if (!drawingTools.includes(tool)) {
            return;
        }

        pushState();

        drawing = true;
        startX = e.offsetX;
        startY = e.offsetY;

        ctx.lineWidth = tool === "eraser" ? 16 : 2;
        ctx.strokeStyle = tool === "eraser" ? "rgba(0,0,0,1)" : color;
        ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";

        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (tool === "pencil" || tool === "eraser") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!drawing) return;

        const x = e.offsetX;
        const y = e.offsetY;

        if (tool === "pencil" || tool === "eraser") {
            ctx.lineTo(x, y);
            ctx.stroke();
            return;
        }

        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();

        if (tool === "rect") {
            ctx.strokeRect(startX, startY, x - startX, y - startY);
        } else if (tool === "circle") {
            const radius = Math.hypot(x - startX, y - startY);
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (tool === "line") {
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });

    const stopDrawing = () => {
        if (drawing) {
            drawing = false;
            ctx.globalCompositeOperation = "source-over";
            if (tool !== "pencil" && tool !== "eraser" && snapshot) {
                snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
            }
        }
    };

    canvas.addEventListener("mouseup", () => {
        stopDrawing();
        saveCanvasToStorage();
    });
    canvas.addEventListener("mouseleave", stopDrawing);

    clearCanvas.addEventListener("click", () => {
        pushState();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = "source-over";
        snapshot = null;
        saveCanvasToStorage();
    });

    addNoteBtn.addEventListener("click", () => {
        const note = document.createElement("div");
        note.className = "note";
        note.style.left = "100px";
        note.style.top = "100px";

        const del = document.createElement("div");
        del.className = "delete-btn";
        del.textContent = "✕";
        del.addEventListener("click", () => {
            note.remove();
            saveNotesToStorage();
        });

        const content = document.createElement("div");
        content.className = "note-body";
        content.contentEditable = "true";
        content.textContent = "Escribe aquí...";
        content.addEventListener("blur", saveNotesToStorage);

        note.appendChild(del);
        note.appendChild(content);
        notesLayer.appendChild(note);
        makeDraggable(note);
        saveNotesToStorage();
        content.focus();
    });

    function makeDraggable(el) {
        let offsetX = 0;
        let offsetY = 0;
        let dragging = false;

        el.addEventListener("mousedown", (e) => {
            if (e.target.classList.contains("delete-btn") || e.target.classList.contains("note-body") || e.target.isContentEditable) return;
            dragging = true;
            const rect = el.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            el.style.cursor = "grabbing";
        });

        document.addEventListener("mousemove", (e) => {
            if (!dragging) return;
            const boardRect = notesLayer.getBoundingClientRect();
            const left = e.clientX - boardRect.left - offsetX;
            const top = e.clientY - boardRect.top - offsetY;
            el.style.left = Math.max(0, left) + "px";
            el.style.top = Math.max(0, top) + "px";
        });

        document.addEventListener("mouseup", () => {
            if (!dragging) return;
            dragging = false;
            el.style.cursor = "move";
            saveNotesToStorage();
        });
    }
});