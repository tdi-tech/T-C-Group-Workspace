import './index.css'
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, addDoc, deleteDoc } from 'firebase/firestore';
import {
    LayoutDashboard,
    ListChecks,
    ClipboardCheck,
    Users,
    BookOpen,
    Cloud,
    CloudLightning,
    AlertTriangle,
    Archive,
    Plus,
    ExternalLink,
    Printer,
    Trash2,
    FileText,
    Palette,
    ShieldCheck,
    Code,
    Laptop,
    CheckSquare,
    Wrench,
    Lock,
    CalendarDays
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE Y ESTADO GLOBAL ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'nmx-r-025-project';

// Tareas del Roadmap de Desarrollo Web (25 Lineamientos)
const PRIMARY_TASKS = [
    { id: 'l_1', phase: 0, phaseName: 'Estrategia y Arquitectura', title: 'Nuevo Sitio Accesible', desc: 'Diseñar y desarrollar un nuevo sitio web institucional utilizando tecnología compatible con estándares de accesibilidad digital.' },
    { id: 'l_2', phase: 0, phaseName: 'Estrategia y Arquitectura', title: 'Arquitectura de Navegación', desc: 'Definir una arquitectura del sitio que facilite la navegación clara y comprensible para todo tipo de usuarios.' },
    { id: 'l_3', phase: 0, phaseName: 'Estrategia y Arquitectura', title: 'Alineación WCAG 2.1 AA', desc: 'Alinear el desarrollo del sitio con los criterios internacionales de accesibilidad WCAG 2.1 Nivel AA.' },
    { id: 'l_16', phase: 1, phaseName: 'Contenido y Lenguaje', title: 'Lenguaje Claro e Incluyente', desc: 'Revisar todos los contenidos institucionales para asegurar el uso de lenguaje claro, simple e incluyente.' },
    { id: 'l_17', phase: 1, phaseName: 'Contenido y Lenguaje', title: 'Eliminar Discriminación', desc: 'Eliminar expresiones o contenidos que puedan interpretarse como discriminatorios o excluyentes.' },
    { id: 'l_20', phase: 1, phaseName: 'Contenido y Lenguaje', title: 'Sección de Políticas', desc: 'Incorporar secciones visibles donde se publiquen las políticas institucionales de igualdad laboral y no discriminación.' },
    { id: 'l_21', phase: 1, phaseName: 'Contenido y Lenguaje', title: 'Código de Ética', desc: 'Publicar en el sitio el Código de Ética y Conducta de la organización.' },
    { id: 'l_6', phase: 2, phaseName: 'Diseño UI y Visuales', title: 'Contraste de Colores', desc: 'Optimizar el contraste de colores entre fondo y texto para asegurar una adecuada legibilidad.' },
    { id: 'l_7', phase: 2, phaseName: 'Diseño UI y Visuales', title: 'Tipografías Legibles', desc: 'Implementar tipografías legibles y tamaños de fuente adecuados para facilitar la lectura del contenido.' },
    { id: 'l_18', phase: 2, phaseName: 'Diseño UI y Visuales', title: 'Representación Diversa', desc: 'Evaluar las imágenes, banners y material visual del sitio para asegurar una representación diversa e incluyente.' },
    { id: 'l_19', phase: 2, phaseName: 'Diseño UI y Visuales', title: 'Evitar Estereotipos', desc: 'Evitar el uso de imágenes que refuercen estereotipos de género o que cosifiquen a las personas.' },
    { id: 'l_9', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Encabezados Jerárquicos', desc: 'Estructurar el contenido utilizando encabezados jerárquicos (H1, H2, H3) para facilitar la navegación mediante lectores de pantalla.' },
    { id: 'l_4', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Textos Alternativos (ALT)', desc: 'Incorporar texto alternativo (ALT) en todas las imágenes, gráficos, ilustraciones y elementos visuales del sitio.' },
    { id: 'l_5', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Descripciones de Gráficos', desc: 'Garantizar que los elementos gráficos cuenten con descripciones comprensibles para tecnologías asistivas.' },
    { id: 'l_8', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Diseño Responsivo', desc: 'Permitir que el contenido pueda ser ampliado o visualizado correctamente en diferentes tamaños de pantalla.' },
    { id: 'l_10', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Navegación por Teclado', desc: 'Diseñar el sitio de manera que pueda ser navegado mediante teclado, sin depender exclusivamente del uso del mouse.' },
    { id: 'l_12', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Formularios Accesibles', desc: 'Implementar etiquetas y descripciones adecuadas en formularios y campos de captura de información.' },
    { id: 'l_13', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Evitar Trampas de Navegación', desc: 'Evitar el uso de elementos que puedan dificultar la navegación para personas con discapacidad.' },
    { id: 'l_22', phase: 3, phaseName: 'Desarrollo Web (Código)', title: 'Canal de Quejas Visible', desc: 'Habilitar un canal visible para la recepción de comentarios, sugerencias o quejas relacionadas con discriminación.' },
    { id: 'l_11', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'Compatibilidad con Lectores', desc: 'Garantizar la compatibilidad del sitio con lectores de pantalla utilizados por personas con discapacidad visual.' },
    { id: 'l_14', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'PDFs Accesibles', desc: 'Incluir documentos institucionales descargables en formatos accesibles, compatibles con tecnologías asistivas.' },
    { id: 'l_15', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'Verificación de Descargables', desc: 'Verificar que los archivos descargables puedan ser interpretados correctamente por lectores de pantalla.' },
    { id: 'l_23', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'Pruebas Internas', desc: 'Realizar pruebas internas de accesibilidad digital antes de la publicación del sitio.' },
    { id: 'l_24', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'Documentación de Pruebas', desc: 'Documentar los resultados de las pruebas de accesibilidad realizadas durante el desarrollo.' },
    { id: 'l_25', phase: 4, phaseName: 'Documentos y Pruebas (QA)', title: 'Expediente NMX-R-025', desc: 'Mantener evidencia documental del proceso de implementación como parte del expediente de cumplimiento de la norma.' }
];

// Tareas: Roadmap de Auditoría y Documentos
const SECONDARY_TASKS = [
    { id: 'aud_1', phase: 0, phaseName: 'Auditoría en Diseño (Pre-Código)', title: 'Sistema de Diseño (Tokens)', desc: 'Validar paleta de colores (Contraste 4.5:1) y tipografías en Figma.' },
    { id: 'aud_2', phase: 0, phaseName: 'Auditoría en Diseño (Pre-Código)', title: 'Auditoría de Componentes', desc: 'Revisar estados: hover, focus, active, disabled y su legibilidad.' },
    { id: 'aud_3', phase: 0, phaseName: 'Auditoría en Diseño (Pre-Código)', title: 'Auditoría de Flujos', desc: 'Carga cognitiva, CTAs claros y prevención de errores en formularios.' },
    { id: 'aud_4', phase: 0, phaseName: 'Auditoría en Diseño (Pre-Código)', title: 'Handoff Accesible', desc: 'Entregar a desarrollo anotaciones de foco, orden de lectura y roles ARIA.' },
    { id: 'dec_1', phase: 1, phaseName: 'Declaración de Accesibilidad', title: '1. Compromiso Explícito', desc: 'Redactar declaración de intenciones hacia la accesibilidad y no discriminación.' },
    { id: 'dec_2', phase: 1, phaseName: 'Declaración de Accesibilidad', title: '2. Estándares y Estado', desc: 'Mencionar WCAG 2.1 AA y detallar objetivamente qué se cumple y qué no.' },
    { id: 'dec_3', phase: 1, phaseName: 'Declaración de Accesibilidad', title: '3. Evaluaciones y Tecnologías', desc: 'Listar herramientas usadas (WAVE, NVDA) y navegadores compatibles.' },
    { id: 'dec_4', phase: 1, phaseName: 'Declaración de Accesibilidad', title: '4. Canal de Retroalimentación', desc: 'Añadir método de contacto para que los usuarios reporten barreras digitales.' }
];

const ALL_TASKS = [...PRIMARY_TASKS, ...SECONDARY_TASKS];
const DEFAULT_STATE = ALL_TASKS.reduce((acc, task) => ({ ...acc, [task.id]: false }), {});

export default function App() {
    const [user, setUser] = useState(null);
    const [activeView, setActiveView] = useState('dashboard');
    const [activeDocTab, setActiveDocTab] = useState('normativa');
    const [taskState, setTaskState] = useState(DEFAULT_STATE);
    const [evidenceLogs, setEvidenceLogs] = useState([]);
    const [syncStatus, setSyncStatus] = useState('connecting');
    const [showLogModal, setShowLogModal] = useState(false);

    // Inicialización y Auth
    useEffect(() => {
    const initAuth = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error) {
            console.error("Auth error:", error);
            setSyncStatus('error');
        }
    };

    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
    });

    return () => unsubscribe();
}, []);

    // Sync Firestore
    useEffect(() => {
        if (!user) return;
        const stateRef = doc(db, 'artifacts', appId, 'public', 'data', 'projectState', 'main');
        const unsubTasks = onSnapshot(stateRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    setTaskState(docSnap.data());
                    setSyncStatus('synced');
                } else {
                    setDoc(stateRef, DEFAULT_STATE).then(() => setSyncStatus('synced'));
                }
            },
            () => setSyncStatus('error')
        );

        const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'evidenceLogs');
        const unsubLogs = onSnapshot(logsRef,
            (snapshot) => {
                const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                logs.sort((a, b) => b.timestamp - a.timestamp);
                setEvidenceLogs(logs);
            }
        );

        return () => { unsubTasks(); unsubLogs(); };
    }, [user]);

    // Manejadores
    const toggleTask = async (taskId) => {
        if (!user || syncStatus !== 'synced') return;
        const newState = { ...taskState, [taskId]: !taskState[taskId] };
        setTaskState(newState);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'projectState', 'main'), newState, { merge: true });
        }
        catch (error) { console.error("Error saving:", error); }
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!user) return;
        const formData = new FormData(e.target);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'evidenceLogs'), {
                date: new Date().toLocaleDateString('es-MX'),
                timestamp: Date.now(),
                evaluator: formData.get('evaluator'),
                taskCategory: formData.get('taskCategory'),
                tool: formData.get('tool'),
                notes: formData.get('notes'),
                evidenceLink: formData.get('evidenceLink')
            });
            setShowLogModal(false);
        } catch (error) {
            console.error(error);
            alert("Error al guardar.");
        }
    };

    const handleDeleteLog = async (logId) => {
        if (!user) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'evidenceLogs', logId));
        }
        catch (error) {
            console.error(error);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Cálculos Globales
    const completedTasks = Object.values(taskState).filter(Boolean).length;
    const globalProgress = ALL_TASKS.length === 0 ? 0 : Math.round((completedTasks / ALL_TASKS.length) * 100);

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans text-slate-900 print:bg-white print:m-0">

            {/* SIDEBAR */}
            <nav className="bg-slate-900 text-white w-full md:w-72 flex-shrink-0 flex flex-col shadow-2xl z-20 print:hidden h-screen sticky top-0 overflow-y-auto">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold tracking-tight text-blue-400">T&C Group</h1>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Workspace NMX-R-025</p>

                    <div className="mt-4 flex items-center text-xs font-medium px-3 py-1.5 rounded-full bg-slate-800 w-fit">
                        {syncStatus === 'connecting' && <Cloud className="w-4 h-4 mr-2 text-yellow-400 animate-pulse" />}
                        {syncStatus === 'synced' && <CloudLightning className="w-4 h-4 mr-2 text-emerald-400" />}
                        {syncStatus === 'error' && <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />}
                        <span className={syncStatus === 'synced' ? 'text-emerald-400' : syncStatus === 'error' ? 'text-red-400' : 'text-yellow-400'}>
                            {syncStatus === 'connecting' ? 'Conectando...' : syncStatus === 'synced' ? 'Sincronizado' : 'Modo offline'}
                        </span>
                    </div>
                </div>

                <div className="flex-grow flex flex-col gap-2 px-4 py-6">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2">Gestión</div>
                    <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard y Gantt" view="dashboard" activeView={activeView} setView={setActiveView} />
                    <NavItem icon={<Archive className="w-5 h-5" />} label="Expediente Auditoría" view="evidence" activeView={activeView} setView={setActiveView} />

                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2 ml-2">Roadmaps</div>
                    <NavItem icon={<ListChecks className="w-5 h-5" />} label="Desarrollo Web (25 pts)" view="roadmap_dev" activeView={activeView} setView={setActiveView} />
                    <NavItem icon={<ClipboardCheck className="w-5 h-5" />} label="Diseño y Documentos" view="roadmap_docs" activeView={activeView} setView={setActiveView} />

                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 mb-2 ml-2">Recursos</div>
                    <NavItem icon={<BookOpen className="w-5 h-5" />} label="Base de Conocimiento" view="docs" activeView={activeView} setView={setActiveView} />
                    <NavItem icon={<Users className="w-5 h-5" />} label="Equipo y Stack Técnico" view="equipo" activeView={activeView} setView={setActiveView} />
                </div>

                <div className="p-6 bg-slate-950 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs text-slate-400 font-semibold uppercase">Avance Total</span>
                        <span className="text-blue-400 font-bold text-sm">{globalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${globalProgress}%` }}></div>
                    </div>
                </div>
            </nav>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-grow p-6 md:p-10 lg:p-12 overflow-y-auto print:p-0">

                {/* DASHBOARD Y GANTT */}
                {activeView === 'dashboard' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                        <header className="mb-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Centro de Control Global</h2>
                            <p className="text-lg text-slate-600 mt-2">Visión general del avance y cronograma de las áreas involucradas.</p>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                                <h3 className="text-xl font-bold mb-4 text-slate-800 border-b pb-2">Resumen de Estatus</h3>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    Proyecto integral para certificar la plataforma web institucional bajo el estándar WCAG 2.1 Nivel AA y generar los expedientes necesarios para la NMX-R-025 en un plazo de 4 meses.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                                        <div className="text-3xl font-black text-blue-600">{PRIMARY_TASKS.filter(t => taskState[t.id]).length}/{PRIMARY_TASKS.length}</div>
                                        <div className="text-xs font-semibold text-blue-800 uppercase mt-1">Desarrollo Web</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
                                        <div className="text-3xl font-black text-purple-600">{SECONDARY_TASKS.filter(t => taskState[t.id]).length}/{SECONDARY_TASKS.length}</div>
                                        <div className="text-xs font-semibold text-purple-800 uppercase mt-1">Diseño y Docs</div>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl text-center border border-emerald-100">
                                        <div className="text-3xl font-black text-emerald-600">{evidenceLogs.length}</div>
                                        <div className="text-xs font-semibold text-emerald-800 uppercase mt-1">Evidencias Subidas</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
                                <h3 className="text-lg font-bold mb-4 text-slate-800 text-center">Cumplimiento Total</h3>
                                <div className="relative w-32 h-32 md:w-40 md:h-40">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke={globalProgress === 100 ? "#10b981" : "#3b82f6"} strokeWidth="12"
                                            strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * globalProgress) / 100}
                                            className="transition-all duration-1000 ease-out"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl md:text-3xl font-black text-slate-800">{globalProgress}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN DEL DIAGRAMA DE GANTT */}
                        <GanttChart />

                    </div>
                )}

                {/* ROADMAPS */}
                {activeView === 'roadmap_dev' && (
                    <RoadmapView
                        tasksArray={PRIMARY_TASKS}
                        title="Roadmap: Desarrollo Web"
                        subtitle="Los 25 lineamientos textuales de la norma para la construcción en WordPress."
                        taskState={taskState}
                        toggleTask={toggleTask}
                    />
                )}

                {activeView === 'roadmap_docs' && (
                    <RoadmapView
                        tasksArray={SECONDARY_TASKS}
                        title="Roadmap: Auditoría y Documentación"
                        subtitle="Pasos obligatorios para auditar desde Figma y redactar los documentos legales."
                        taskState={taskState}
                        toggleTask={toggleTask}
                    />
                )}

                {/* EXPEDIENTE DE EVIDENCIA */}
                {activeView === 'evidence' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 flex items-center">
                                    <Archive className="mr-3 w-8 h-8 text-blue-600" /> Expediente de Auditoría
                                </h2>
                                <p className="text-lg text-slate-600 mt-1 print:hidden">Historial de pruebas documentadas para la NMX-R-025.</p>
                            </div>
                            <div className="flex gap-3 print:hidden">
                                <button onClick={handlePrint} className="flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors">
                                    <Printer className="w-4 h-4 mr-2" /> Exportar Reporte
                                </button>
                                <button onClick={() => setShowLogModal(true)} className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap">
                                    <Plus className="w-4 h-4 mr-2" /> Agregar Evidencia
                                </button>
                            </div>
                        </header>

                        {/* Header Impresión */}
                        <div className="hidden print:block mb-8 pb-4 border-b-2 border-slate-900">
                            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">T&C Group - Expediente de Evidencias</h1>
                            <p className="text-slate-600">Cumplimiento de la Norma Mexicana NMX-R-025-SCFI-2015</p>
                            <p className="text-slate-600">Componente: Comunicación Externa y Accesibilidad Digital</p>
                            <p className="text-sm mt-2 font-mono">Fecha de Generación: {new Date().toLocaleDateString('es-MX')}</p>
                        </div>

                        {evidenceLogs.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 md:p-12 text-center print:hidden">
                                <Archive className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-800">No hay evidencias registradas</h3>
                                <p className="text-slate-500 mt-2 max-w-md mx-auto">La norma requiere documentar evaluaciones de contraste visual, revisiones semánticas y pruebas de navegación.</p>
                                <button onClick={() => setShowLogModal(true)} className="mt-6 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Comenzar Bitácora</button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm min-w-[800px]">
                                        <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 font-semibold w-24">Fecha</th>
                                                <th className="p-4 font-semibold w-40">Evaluador</th>
                                                <th className="p-4 font-semibold w-48">Categoría</th>
                                                <th className="p-4 font-semibold w-40">Herramienta</th>
                                                <th className="p-4 font-semibold">Resultados y Notas</th>
                                                <th className="p-4 font-semibold text-center w-16 print:hidden"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {evidenceLogs.map((log) => (
                                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="p-4 whitespace-nowrap text-slate-500">{log.date}</td>
                                                    <td className="p-4 font-medium">{log.evaluator}</td>
                                                    <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold">{log.taskCategory}</span></td>
                                                    <td className="p-4">{log.tool}</td>
                                                    <td className="p-4">
                                                        <p className="text-sm leading-relaxed">{log.notes}</p>
                                                        {log.evidenceLink && (
                                                            <a href={log.evidenceLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 text-xs font-semibold">
                                                                <ExternalLink className="w-3 h-3 mr-1" /> Archivo adjunto
                                                            </a>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center print:hidden">
                                                        <button onClick={() => handleDeleteLog(log.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL EVIDENCIA */}
                {showLogModal && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center"><Plus className="w-5 h-5 mr-2 text-blue-600" /> Nueva Evidencia</h3>
                                <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
                            </div>
                            <form onSubmit={handleAddLog} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre del Evaluador / Área</label>
                                    <input type="text" name="evaluator" required placeholder="Ej. Ana Pérez - UX/UI" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Categoría</label>
                                        <select name="taskCategory" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="Diseño UI (Contraste)">Diseño UI (Contraste/Color)</option>
                                            <option value="Desarrollo (Semántica)">Desarrollo (Semántica/ALT)</option>
                                            <option value="Navegación Teclado">Navegación por Teclado</option>
                                            <option value="Canal Denuncias">Canal de Denuncias</option>
                                            <option value="Documento Legal">Documento Legal / Declaración</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1">Herramienta</label>
                                        <select name="tool" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="WAVE Tool">WAVE Browser Extension</option>
                                            <option value="Stark (Figma)">Stark Plugin (Contraste)</option>
                                            <option value="NVDA Lector">NVDA (Lector de Pantalla)</option>
                                            <option value="Axe DevTools">Axe DevTools</option>
                                            <option value="Prueba Manual Humana">Prueba Manual Humana</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Resultados y Observaciones</label>
                                    <textarea name="notes" required rows="3" placeholder="Describe el resultado." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Enlace a Evidencia (Drive, Docs)</label>
                                    <input type="url" name="evidenceLink" placeholder="https://docs.google.com/..." className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                    <button type="button" onClick={() => setShowLogModal(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium">Cancelar</button>
                                    <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm">Guardar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* WIKI / BASE DE CONOCIMIENTO */}
                {activeView === 'docs' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                        <header className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 flex items-center">
                                <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
                                Wiki Interna del Proyecto
                            </h2>
                            <p className="text-lg text-slate-600 mt-2">Toda la documentación normativa, estratégica y técnica en un solo lugar.</p>
                        </header>

                        <div className="flex overflow-x-auto pb-2 mb-6 border-b border-slate-200 hide-scrollbar">
                            <button onClick={() => setActiveDocTab('normativa')} className={`whitespace-nowrap px-4 py-3 font-semibold border-b-2 transition-colors ${activeDocTab === 'normativa' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                <FileText className="w-4 h-4 inline mr-2" />Protocolo y NMX-R-025
                            </button>
                            <button onClick={() => setActiveDocTab('diseno')} className={`whitespace-nowrap px-4 py-3 font-semibold border-b-2 transition-colors ${activeDocTab === 'diseno' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                <Palette className="w-4 h-4 inline mr-2" />Auditoría desde Diseño
                            </button>
                            <button onClick={() => setActiveDocTab('tecnica')} className={`whitespace-nowrap px-4 py-3 font-semibold border-b-2 transition-colors ${activeDocTab === 'tecnica' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                <Code className="w-4 h-4 inline mr-2" />Estrategia Elementor
                            </button>
                            <button onClick={() => setActiveDocTab('legal')} className={`whitespace-nowrap px-4 py-3 font-semibold border-b-2 transition-colors ${activeDocTab === 'legal' ? 'border-amber-600 text-amber-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                                <ShieldCheck className="w-4 h-4 inline mr-2" />Declaración Legal y Evidencias
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
                            {activeDocTab === 'normativa' && (
                                <div className="prose prose-slate prose-blue max-w-none animate-in fade-in duration-300">
                                    <h3 className="text-2xl text-blue-900 border-b pb-2">Fundamentos de la Norma Mexicana y WCAG</h3>
                                    <p><strong>El Protocolo:</strong> La tecnología del sitio web actual de T&C Group no permite implementar adecuadamente criterios Nivel AA. Se determina la creación de un nuevo sitio que garantice: lenguaje incluyente, representación visual no discriminatoria y accesibilidad digital.</p>

                                    <h4>Los 4 Principios (POUR)</h4>
                                    <ul>
                                        <li><strong>Perceptible:</strong> La información debe ser presentable a los usuarios de formas que puedan percibirla (Ej. Textos ALT, contraste 4.5:1, subtítulos).</li>
                                        <li><strong>Operable:</strong> Los componentes de la interfaz deben ser operables. Todo debe funcionar con el <strong>teclado</strong> sin depender de un ratón (evitar trampas de foco).</li>
                                        <li><strong>Comprensible:</strong> Información y funcionamiento lógico. Lenguaje claro, sin jerga.</li>
                                        <li><strong>Robusto:</strong> El código HTML debe ser semánticamente correcto para ser interpretado por lectores de pantalla (NVDA, VoiceOver).</li>
                                    </ul>

                                    <h4>Lenguaje Incluyente</h4>
                                    <p>Evitar el masculino genérico. Usar formas neutras ("Quien suscribe", "La dirección"). Evitar @, x, o e, ya que rompen la lectura en sintetizadores de voz para ciegos. Evitar imágenes con estereotipos de género o cosificación.</p>
                                </div>
                            )}

                            {activeDocTab === 'diseno' && (
                                <div className="prose prose-slate prose-purple max-w-none animate-in fade-in duration-300">
                                    <h3 className="text-2xl text-purple-900 border-b pb-2">Guía de Auditoría desde el Diseño (Figma/UX)</h3>
                                    <p>Es indispensable auditar la accesibilidad <em>antes</em> de escribir código. El equipo de diseño UX/UI debe aplicar revisiones en 4 niveles:</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mt-6">
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-900 mb-2">1. Sistema Base (Tokens)</h4>
                                            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                                                <li>Validar paleta corporativa con WebAIM Contrast Checker.</li>
                                                <li>Asegurar contraste de 4.5:1 para texto normal.</li>
                                                <li>Definir estilos de "foco" visibles para teclado.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-900 mb-2">2. Componentes UI</h4>
                                            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                                                <li>Revisar estados: Hover, Focus, Active, Disabled.</li>
                                                <li>Mensajes de error deben usar texto, no solo color rojo.</li>
                                                <li>Targets táctiles suficientemente grandes.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-900 mb-2">3. Flujos de Tarea</h4>
                                            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                                                <li>Reducción de carga cognitiva en formularios.</li>
                                                <li>Claridad en la jerarquía (H1, H2) en el diseño.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                            <h4 className="font-bold text-purple-900 mb-2">4. Handoff a Desarrollo</h4>
                                            <ul className="text-sm text-slate-700 space-y-1 list-disc pl-4">
                                                <li>Entregar especificaciones de orden de lectura al dev.</li>
                                                <li>Indicar qué elementos son decorativos (Alt="").</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDocTab === 'tecnica' && (
                                <div className="prose prose-slate prose-emerald max-w-none animate-in fade-in duration-300">
                                    <h3 className="text-2xl text-emerald-900 border-b pb-2">Implementación en WordPress (Elementor Ally)</h3>
                                    <p>La regla de oro técnica: <strong>Un widget flotante NO soluciona el código roto.</strong> La accesibilidad Nivel AA exige HTML semántico nativo.</p>

                                    <h4>La Solución "Elementor Ally"</h4>
                                    <p>Ally es el plugin oficial de Elementor. Debe usarse en dos frentes:</p>
                                    <ol>
                                        <li><strong>Ally Assistant (Backend):</strong> Escáner que detecta más de 180 problemas en el editor. Usarlo para corregir jerarquía de H-tags, contrastes y Textos Alternativos faltantes en imágenes.</li>
                                        <li><strong>Ally Usability Widget (Frontend):</strong> La capa para el visitante. Permitirá a usuarios con baja visión o dislexia invertir colores, pausar animaciones o aumentar el texto.</li>
                                    </ol>

                                    <h4>Canal de Denuncias Seguro</h4>
                                    <div className="bg-red-50 border-l-4 border-red-500 p-4 not-prose my-4">
                                        <p className="text-red-800 font-medium text-sm">PROHIBIDO: Usar Elementor Forms o Contact Form 7 para el buzón de quejas.</p>
                                        <p className="text-red-700 text-xs mt-1">Carecen de anonimización real y exponen la IP. Se exige usar software especializado como KERP, Trusty Whistleblowing o Acatia.</p>
                                    </div>
                                </div>
                            )}

                            {activeDocTab === 'legal' && (
                                <div className="prose prose-slate prose-amber max-w-none animate-in fade-in duration-300">
                                    <h3 className="text-2xl text-amber-900 border-b pb-2">Documentación Legal: La Declaración y Evidencias</h3>

                                    <h4>Estructura de la "Declaración de Accesibilidad"</h4>
                                    <p>Documento público obligatorio en el pie de página que debe contener 7 secciones:</p>
                                    <ol>
                                        <li><strong>Compromiso explícito:</strong> Declaración institucional sobre la inclusión digital.</li>
                                        <li><strong>Estándares aplicados:</strong> Mencionar seguimiento de "WCAG 2.1 nivel AA".</li>
                                        <li><strong>Estado de conformidad:</strong> Indicar honestamente qué partes del sitio cumplen y cuáles tienen barreras actuales.</li>
                                        <li><strong>Tecnologías utilizadas:</strong> HTML5, CSS, ARIA, compatibilidad con navegadores.</li>
                                        <li><strong>Evaluación realizada:</strong> Mencionar pruebas automáticas (WAVE) y manuales (Lector de pantalla).</li>
                                        <li><strong>Contacto (Feedback):</strong> Correo o formulario accesible para reportar problemas de uso.</li>
                                        <li><strong>Actualizaciones:</strong> Fecha de última revisión.</li>
                                    </ol>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* EQUIPO Y STACK */}
                {activeView === 'equipo' && (
                    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
                        <header className="mb-10">
                            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Equipo, Roles y Stack Tecnológico</h2>
                            <p className="text-lg text-slate-600 mt-2">Estructura operativa detallada y herramientas autorizadas para el cumplimiento NMX-R-025.</p>
                        </header>

                        {/* SECCIÓN 1: ROLES */}
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center border-b pb-2">
                            <Users className="w-6 h-6 mr-3 text-blue-600" /> Matriz de Roles y Responsabilidades
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                                    <h4 className="font-bold text-lg text-slate-800">Equipo Interno (T&C Group)</h4>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div>
                                        <h5 className="font-bold text-blue-700 flex items-center mb-2"><Palette className="w-4 h-4 mr-2" /> Diseñadores Gráficos (UX/UI)</h5>
                                        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                                            <li>Validar que los colores de la marca en web cumplan el <strong>ratio 4.5:1</strong>.</li>
                                            <li>Diseñar los "Focus States" (estados de foco al navegar con teclado).</li>
                                            <li>Selección y curaduría de banco de imágenes sin estereotipos de género.</li>
                                            <li><strong>Auditoría a su cargo:</strong> Auditar contrastes y tipografías en Figma.</li>
                                        </ul>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <h5 className="font-bold text-blue-700 flex items-center mb-2"><Laptop className="w-4 h-4 mr-2" /> Diseñadores Web (WordPress)</h5>
                                        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                                            <li>Maquetar con <strong>HTML semántico</strong> (etiquetas H1, H2 secuenciales, header, nav).</li>
                                            <li>Insertar y redactar Atributos ALT en todas las imágenes subidas a medios.</li>
                                            <li>Configurar Elementor Ally y asegurar navegación impecable solo con teclado.</li>
                                        </ul>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <h5 className="font-bold text-blue-700 flex items-center mb-2"><FileText className="w-4 h-4 mr-2" /> PM / Contenido (Marketing)</h5>
                                        <ul className="text-sm text-slate-600 space-y-1 list-disc pl-5">
                                            <li>Redacción con lenguaje claro, impersonal e incluyente.</li>
                                            <li>Redactar la "Declaración de Accesibilidad" legal.</li>
                                            <li>Asegurar que los PDFs institucionales subidos estén etiquetados (Accesibles).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-slate-900 px-6 py-4 border-b border-slate-800">
                                    <h4 className="font-bold text-lg text-white">Consultoría Externa (Requerida por Norma)</h4>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <h5 className="font-bold text-blue-900 flex items-center mb-2"><CheckSquare className="w-4 h-4 mr-2" /> Consultor / Auditor QA Accesibilidad</h5>
                                        <p className="text-sm text-blue-800 mb-3">La norma exige pruebas objetivas. Las pruebas automatizadas solo detectan el 30% de los errores.</p>
                                        <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
                                            <li><strong>Perfil ideal:</strong> Auditor certificado (ej. IAAP) o un experto nativo usuario de lectores de pantalla (persona con ceguera).</li>
                                            <li><strong>Misión:</strong> Navegar el sitio completo (NVDA/VoiceOver), intentar llenar formularios y emitir el reporte final de cumplimiento que irá a la STPS.</li>
                                        </ul>
                                    </div>
                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <h5 className="font-bold text-amber-900 flex items-center mb-2"><ShieldCheck className="w-4 h-4 mr-2" /> Especialista Legal / Compliance</h5>
                                        <ul className="text-sm text-slate-700 space-y-1 list-disc pl-5">
                                            <li><strong>Misión:</strong> Validar que las políticas institucionales de igualdad y el Código de Ética estén publicados legalmente.</li>
                                            <li>Asegurar que el SaaS contratado para el <strong>Canal de Denuncias</strong> garantice el anonimato total y el cifrado de datos (Ley de Protección de Datos).</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN 2: STACK TECNOLÓGICO */}
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center border-b pb-2">
                            <Wrench className="w-6 h-6 mr-3 text-blue-600" /> Stack Tecnológico Autorizado
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><Palette className="w-5 h-5 text-purple-600" /></div>
                                <h4 className="font-bold text-slate-800 mb-2">Diseño y Prototipado</h4>
                                <ul className="space-y-3 mt-4">
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Figma + Plugin Stark</span>
                                        <span className="text-slate-500">Para revisar contraste y simular daltonismo en fase de diseño.</span>
                                    </li>
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">WebAIM Contrast Checker</span>
                                        <span className="text-slate-500">Herramienta web oficial para validación matemática (4.5:1).</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><Laptop className="w-5 h-5 text-blue-600" /></div>
                                <h4 className="font-bold text-slate-800 mb-2">Construcción Core (CMS)</h4>
                                <ul className="space-y-3 mt-4">
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">WordPress + Elementor Pro</span>
                                        <span className="text-slate-500">Motor principal de construcción visual.</span>
                                    </li>
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Hello Elementor / Astra</span>
                                        <span className="text-slate-500">Temas certificados como "Accessibility-Ready", sin código basura.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Code className="w-5 h-5 text-emerald-600" /></div>
                                <h4 className="font-bold text-slate-800 mb-2">Ecosistema Accesibilidad (WP)</h4>
                                <ul className="space-y-3 mt-4">
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Ally by Elementor</span>
                                        <span className="text-slate-500">Escáner interno de remediación e interfaz de widget para el usuario final.</span>
                                    </li>
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">WP Accessibility Plugin</span>
                                        <span className="text-slate-500">Fuerza el atributo de idioma (lang) y añade links de "saltar al contenido".</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4"><ListChecks className="w-5 h-5 text-orange-600" /></div>
                                <h4 className="font-bold text-slate-800 mb-2">Auditoría y Testing QA</h4>
                                <ul className="space-y-3 mt-4">
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">WAVE Tool / Axe DevTools</span>
                                        <span className="text-slate-500">Extensiones de Chrome para escaneo automatizado en código.</span>
                                    </li>
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">NVDA / Apple VoiceOver</span>
                                        <span className="text-slate-500">Lectores de pantalla nativos para pruebas humanas obligatorias.</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200 lg:col-span-2 xl:col-span-2">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-4"><Lock className="w-5 h-5 text-red-600" /></div>
                                <h4 className="font-bold text-slate-800 mb-2">Canal de Denuncias Cifrado (Requisito Crítico)</h4>
                                <div className="bg-red-50 p-3 rounded text-xs text-red-800 font-medium mb-3">No utilizar Elementor Forms ni Contact Form 7. Exponen datos y no permiten comunicación bidireccional anónima.</div>
                                <ul className="space-y-3 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">KERP (Plugin WP Especializado)</span>
                                        <span className="text-slate-500">Buzón anónimo dentro de WP, protección de IP y plazos legales.</span>
                                    </li>
                                    <li className="text-sm">
                                        <span className="font-semibold text-slate-900 block">Trusty / Acatia (SaaS)</span>
                                        <span className="text-slate-500">Plataformas externas especializadas (Whistleblowing) integradas vía iFrame/Link.</span>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

// Componente para renderizar la navegación lateral
function NavItem({ icon, label, view, activeView, setView }) {
    const isActive = activeView === view;
    return (
        <button onClick={() => setView(view)} className={`flex items-center w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <span className={`mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
            {label}
        </button>
    );
}

// Componente para renderizar los roadmaps
function RoadmapView({ tasksArray, title, subtitle, taskState, toggleTask }) {
    const phases = [...new Set(tasksArray.map(t => t.phase))];

    return (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 print:hidden">
            <header className="mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
                    <p className="text-lg text-slate-600 mt-1">{subtitle}</p>
                </div>
            </header>
            <div className="space-y-6">
                {phases.map(phaseIdx => {
                    const phaseTasks = tasksArray.filter(t => t.phase === phaseIdx);
                    const isPhaseComplete = phaseTasks.every(t => taskState[t.id]);
                    return (
                        <div key={phaseIdx} className={`bg-white rounded-xl border transition-colors ${isPhaseComplete ? 'border-emerald-200' : 'border-slate-200'} overflow-hidden shadow-sm`}>
                            <div className={`p-4 border-b flex justify-between items-center ${isPhaseComplete ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                                <h3 className={`text-xl font-bold ${isPhaseComplete ? 'text-emerald-800' : 'text-slate-800'}`}>
                                    Fase {phaseIdx + 1}: {phaseTasks[0]?.phaseName}
                                </h3>
                                {isPhaseComplete && <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider hidden sm:block">Completada</span>}
                            </div>
                            <div className="divide-y divide-slate-100 p-2">
                                {phaseTasks.map(task => (
                                    <label key={task.id} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors cursor-pointer rounded-lg">
                                        <div className="relative flex items-start pt-1">
                                            <input type="checkbox" checked={taskState[task.id] || false} onChange={() => toggleTask(task.id)} className="peer w-5 h-5 accent-blue-600 rounded border-slate-300 cursor-pointer transition-all" />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`font-semibold transition-colors ${taskState[task.id] ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</div>
                                            <div className={`text-sm mt-1 transition-colors ${taskState[task.id] ? 'text-slate-400' : 'text-slate-600'}`}>{task.desc}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Componente para el Diagrama de Gantt
function GanttChart() {
    const months = [
        { name: 'Mes 1', weeks: 4 },
        { name: 'Mes 2', weeks: 4 },
        { name: 'Mes 3', weeks: 4 },
        { name: 'Mes 4', weeks: 4 },
    ];

    const ganttData = [
        { area: 'Estrategia y Arquitectura Web', start: 1, end: 2, color: 'bg-slate-600' },
        { area: 'Auditoría de Contenido y Lenguaje', start: 1, end: 4, color: 'bg-indigo-500' },
        { area: 'Auditoría en Diseño UI (Pre-Código)', start: 3, end: 6, color: 'bg-purple-500' },
        { area: 'Desarrollo en WordPress (Elementor)', start: 5, end: 12, color: 'bg-blue-600' },
        { area: 'Canal de Denuncias (Implementación Legal)', start: 10, end: 12, color: 'bg-red-500' },
        { area: 'Pruebas QA Manuales (Lector de Pantalla)', start: 11, end: 15, color: 'bg-orange-500' },
        { area: 'Expediente Documental y Declaración', start: 14, end: 16, color: 'bg-emerald-500' }
    ];

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 mt-8 mb-8 overflow-x-auto">
            <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-3 flex items-center">
                <CalendarDays className="w-6 h-6 mr-3 text-blue-600" />
                Cronograma de Ejecución (4 Meses)
            </h3>

            <div className="min-w-[700px]">
                <div className="flex border-b border-slate-200 mb-4 pb-2">
                    <div className="w-1/3 font-bold text-sm text-slate-600 uppercase tracking-wider pl-2">Área / Fase del Proyecto</div>
                    <div className="w-2/3 flex">
                        {months.map((m, idx) => (
                            <div key={idx} className="flex-1 text-center font-bold text-sm text-slate-600 uppercase tracking-wider border-l border-slate-200/50">
                                {m.name}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-5">
                    {ganttData.map((row, idx) => (
                        <div key={idx} className="flex items-center group">
                            <div className="w-1/3 pr-4 text-sm font-medium text-slate-700 leading-tight pl-2 border-l-2 border-transparent group-hover:border-blue-500 transition-colors">
                                {row.area}
                            </div>
                            <div className="w-2/3 relative h-8 bg-slate-50/80 rounded-md overflow-hidden border border-slate-100">
                                <div className="absolute inset-0 flex">
                                    {[...Array(16)].map((_, i) => (
                                        <div key={i} className={`flex-1 border-l ${i % 4 === 0 ? 'border-slate-200' : 'border-slate-100'} h-full`}></div>
                                    ))}
                                </div>
                                <div
                                    className={`absolute top-1 bottom-1 ${row.color} rounded shadow-sm flex items-center justify-center text-[10px] sm:text-xs text-white font-bold px-2 whitespace-nowrap overflow-hidden hover:opacity-90 transition-opacity cursor-default`}
                                    style={{
                                        left: `${((row.start - 1) / 16) * 100}%`,
                                        width: `${((row.end - row.start + 1) / 16) * 100}%`
                                    }}
                                    title={`Semanas ${row.start} a ${row.end}`}
                                >
                                    Sem. {row.start}-{row.end}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
                    <span>Simulación basada en el requerimiento de 4 meses y flujo técnico.</span>
                    <div className="flex gap-4">
                        <span className="flex items-center"><div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div> Diseño</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-blue-600 rounded-sm mr-2"></div> Desarrollo</span>
                        <span className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-sm mr-2"></div> Testing QA</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
