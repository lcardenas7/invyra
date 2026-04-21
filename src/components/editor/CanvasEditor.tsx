"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { 
  Type, Image as ImageIcon, Square, Circle, Trash2, 
  Copy, Layers, ChevronUp, ChevronDown, Bold, Italic,
  AlignLeft, AlignCenter, AlignRight, Palette, Undo, Redo,
  ZoomIn, ZoomOut, Download, Save, Flower2, Search, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { allElements, elementCategories, getElementsByCategory, searchElements, type DecorativeElement } from "@/data/assets/decorative-elements";

interface CanvasEditorProps {
  initialData?: string;
  onSave?: (data: string) => void;
  templateColors?: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}

const FONTS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Montserrat",
  "Inter",
  "Great Vibes",
  "Lato",
  "Amatic SC",
  "Josefin Sans",
  "Cinzel",
  "Raleway",
  "Poiret One",
  "Quicksand",
];

export default function CanvasEditor({ initialData, onSave, templateColors }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showElementsPanel, setShowElementsPanel] = useState(false);
  const [elementCategory, setElementCategory] = useState<string>("flowers");
  const [elementSearch, setElementSearch] = useState("");

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 600,
      backgroundColor: templateColors?.background || "#FDFBF7",
      preserveObjectStacking: true,
    });

    fabricRef.current = canvas;

    // Load initial data or create default template elements
    let dataLoaded = false;
    if (initialData) {
      try {
        const parsed = JSON.parse(initialData);
        if (parsed.objects && Array.isArray(parsed.objects) && parsed.objects.length > 0) {
          canvas.loadFromJSON(parsed, () => {
            canvas.renderAll();
          });
          dataLoaded = true;
        }
      } catch (e) {
        console.error("Error loading canvas data:", e);
      }
    }
    
    // Add default elements if no data was loaded
    if (!dataLoaded) {
      const centerX = 200;
      
      const invitation = new fabric.IText("Te invitamos a celebrar", {
        left: centerX,
        top: 100,
        fontSize: 14,
        fontFamily: "Montserrat",
        fill: "#888888",
        originX: "center",
        originY: "center",
        textAlign: "center",
      });
      
      const title = new fabric.IText("Nombre & Nombre", {
        left: centerX,
        top: 160,
        fontSize: 32,
        fontFamily: "Playfair Display",
        fill: templateColors?.text || "#2C2C2C",
        originX: "center",
        originY: "center",
        textAlign: "center",
      });
      
      const ampersand = new fabric.IText("&", {
        left: centerX,
        top: 220,
        fontSize: 40,
        fontFamily: "Great Vibes",
        fill: templateColors?.primary || "#D4AF37",
        originX: "center",
        originY: "center",
      });
      
      const date = new fabric.IText("15 de Junio, 2025", {
        left: centerX,
        top: 320,
        fontSize: 18,
        fontFamily: "Montserrat",
        fill: templateColors?.text || "#2C2C2C",
        originX: "center",
        originY: "center",
        textAlign: "center",
      });
      
      const time = new fabric.IText("5:00 PM", {
        left: centerX,
        top: 360,
        fontSize: 16,
        fontFamily: "Montserrat",
        fill: templateColors?.primary || "#D4AF37",
        originX: "center",
        originY: "center",
      });
      
      const location = new fabric.IText("Lugar del evento", {
        left: centerX,
        top: 420,
        fontSize: 14,
        fontFamily: "Montserrat",
        fill: "#666666",
        originX: "center",
        originY: "center",
        textAlign: "center",
      });
      
      canvas.add(invitation, title, ampersand, date, time, location);
      canvas.renderAll();
    }
    
    // Save initial state to history
    setTimeout(() => saveToHistory(), 100);

    // Event listeners
    canvas.on("selection:created", (e: fabric.IEvent<MouseEvent>) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:updated", (e: fabric.IEvent<MouseEvent>) => {
      setSelectedObject(e.selected?.[0] || null);
    });

    canvas.on("selection:cleared", () => {
      setSelectedObject(null);
    });

    canvas.on("object:modified", () => {
      saveToHistory();
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  const saveToHistory = useCallback(() => {
    if (!fabricRef.current) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      return [...newHistory, json];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex <= 0 || !fabricRef.current) return;
    const newIndex = historyIndex - 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !fabricRef.current) return;
    const newIndex = historyIndex + 1;
    fabricRef.current.loadFromJSON(JSON.parse(history[newIndex]), () => {
      fabricRef.current?.renderAll();
      setHistoryIndex(newIndex);
    });
  };

  const addText = () => {
    if (!fabricRef.current) return;
    const text = new fabric.IText("Texto aquí", {
      left: 200,
      top: 300,
      fontSize: 32,
      fontFamily: "Playfair Display",
      fill: templateColors?.text || "#2C2C2C",
      originX: "center",
      originY: "center",
    });
    fabricRef.current.add(text);
    fabricRef.current.setActiveObject(text);
    saveToHistory();
  };

  const addShape = (type: "rect" | "circle") => {
    if (!fabricRef.current) return;
    
    let shape: fabric.Object;
    
    if (type === "rect") {
      shape = new fabric.Rect({
        left: 150,
        top: 250,
        width: 100,
        height: 100,
        fill: templateColors?.primary || "#D4AF37",
        rx: 8,
        ry: 8,
      });
    } else {
      shape = new fabric.Circle({
        left: 200,
        top: 300,
        radius: 50,
        fill: templateColors?.primary || "#D4AF37",
        originX: "center",
        originY: "center",
      });
    }
    
    fabricRef.current.add(shape);
    fabricRef.current.setActiveObject(shape);
    saveToHistory();
  };

  const addImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fabricRef.current) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      fabric.Image.fromURL(imgUrl, (img: fabric.Image) => {
        img.scaleToWidth(200);
        img.set({
          left: 200,
          top: 300,
          originX: "center",
          originY: "center",
        });
        fabricRef.current?.add(img);
        fabricRef.current?.setActiveObject(img);
        saveToHistory();
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const deleteSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.remove(selectedObject);
    setSelectedObject(null);
    saveToHistory();
  };

  const duplicateSelected = () => {
    if (!fabricRef.current || !selectedObject) return;
    selectedObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: (cloned.left || 0) + 20,
        top: (cloned.top || 0) + 20,
      });
      fabricRef.current?.add(cloned);
      fabricRef.current?.setActiveObject(cloned);
      saveToHistory();
    });
  };

  const bringForward = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.bringForward(selectedObject);
    saveToHistory();
  };

  const sendBackward = () => {
    if (!fabricRef.current || !selectedObject) return;
    fabricRef.current.sendBackwards(selectedObject);
    saveToHistory();
  };

  const updateTextProperty = (property: string, value: any) => {
    if (!selectedObject || selectedObject.type !== "i-text") return;
    (selectedObject as fabric.IText).set(property as keyof fabric.IText, value);
    fabricRef.current?.renderAll();
    saveToHistory();
  };

  const updateObjectColor = (color: string) => {
    if (!selectedObject) return;
    selectedObject.set("fill", color);
    fabricRef.current?.renderAll();
    saveToHistory();
  };

  const handleZoom = (direction: "in" | "out") => {
    if (!fabricRef.current) return;
    const newZoom = direction === "in" ? zoom * 1.1 : zoom / 1.1;
    const clampedZoom = Math.max(0.5, Math.min(2, newZoom));
    setZoom(clampedZoom);
    fabricRef.current.setZoom(clampedZoom);
    fabricRef.current.renderAll();
  };

  const handleSave = () => {
    if (!fabricRef.current || !onSave) return;
    const json = JSON.stringify(fabricRef.current.toJSON());
    onSave(json);
  };

  const addDecorativeElement = (element: DecorativeElement) => {
    if (!fabricRef.current) return;
    const svgString = element.svg;
    fabric.loadSVGFromString(svgString, (objects, options) => {
      const group = fabric.util.groupSVGElements(objects, options);
      const scale = Math.min(150 / element.width, 150 / element.height);
      group.set({
        left: 200,
        top: 300,
        originX: "center",
        originY: "center",
        scaleX: scale,
        scaleY: scale,
      });
      fabricRef.current?.add(group);
      fabricRef.current?.setActiveObject(group);
      fabricRef.current?.renderAll();
      saveToHistory();
    });
  };

  const getFilteredElements = () => {
    if (elementSearch) return searchElements(elementSearch);
    return getElementsByCategory(elementCategory);
  };

  const downloadAsImage = () => {
    if (!fabricRef.current) return;
    const dataURL = fabricRef.current.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });
    const link = document.createElement("a");
    link.download = "invitacion.png";
    link.href = dataURL;
    link.click();
  };

  return (
    <div className="flex h-full bg-gray-100">
      {/* Left Toolbar */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={addText}
          title="Agregar texto"
        >
          <Type className="w-5 h-5" />
        </Button>
        
        <Button
          variant={showElementsPanel ? "default" : "ghost"}
          size="icon"
          onClick={() => setShowElementsPanel(!showElementsPanel)}
          title="Elementos decorativos"
          className={showElementsPanel ? "bg-[#D4AF37] text-white hover:bg-[#B8962E]" : ""}
        >
          <Flower2 className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          title="Agregar imagen"
        >
          <ImageIcon className="w-5 h-5" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={addImage}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addShape("rect")}
          title="Agregar rectángulo"
        >
          <Square className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => addShape("circle")}
          title="Agregar círculo"
        >
          <Circle className="w-5 h-5" />
        </Button>

        <div className="flex-1" />

        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Deshacer"
        >
          <Undo className="w-5 h-5" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Rehacer"
        >
          <Redo className="w-5 h-5" />
        </Button>
      </div>

      {/* Elements Panel */}
      {showElementsPanel && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-sm">Elementos</h3>
            <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => setShowElementsPanel(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={elementSearch}
                onChange={(e) => setElementSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
          </div>

          {!elementSearch && (
            <div className="flex flex-wrap gap-1 px-2 pb-2">
              {elementCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setElementCategory(cat.id)}
                  className={`text-xs px-2 py-1 rounded-full transition-colors ${
                    elementCategory === cat.id
                      ? "bg-[#D4AF37] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
              {getFilteredElements().map((element) => (
                <button
                  key={element.id}
                  onClick={() => addDecorativeElement(element)}
                  className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-2 flex flex-col items-center gap-1 transition-colors group"
                  title={element.name}
                >
                  <div
                    className="w-full aspect-square flex items-center justify-center group-hover:scale-110 transition-transform"
                    dangerouslySetInnerHTML={{ __html: element.svg }}
                  />
                  <span className="text-[10px] text-gray-500 truncate w-full text-center">
                    {element.name}
                  </span>
                </button>
              ))}
            </div>
            {getFilteredElements().length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4">No se encontraron elementos</p>
            )}
          </div>
        </div>
      )}

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        <div 
          className="bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Right Panel - Properties */}
      <div className="w-72 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        {/* Zoom Controls */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <span className="text-sm text-gray-600">Zoom: {Math.round(zoom * 100)}%</span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={() => handleZoom("out")}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => handleZoom("in")}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {selectedObject ? (
          <>
            {/* Object Actions */}
            <div className="mb-6">
              <Label className="text-xs text-gray-500 uppercase tracking-wider">Acciones</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="icon" onClick={duplicateSelected} title="Duplicar">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={bringForward} title="Traer al frente">
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={sendBackward} title="Enviar atrás">
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={deleteSelected}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Text Properties */}
            {selectedObject.type === "i-text" && (
              <>
                <div className="mb-4">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Fuente</Label>
                  <select
                    className="w-full mt-2 p-2 border rounded-md text-sm"
                    value={(selectedObject as fabric.IText).fontFamily}
                    onChange={(e) => updateTextProperty("fontFamily", e.target.value)}
                  >
                    {FONTS.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Tamaño</Label>
                  <Input
                    type="number"
                    min={8}
                    max={200}
                    value={(selectedObject as fabric.IText).fontSize}
                    onChange={(e) => updateTextProperty("fontSize", parseInt(e.target.value))}
                    className="mt-2"
                  />
                </div>

                <div className="mb-4">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Estilo</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={(selectedObject as fabric.IText).fontWeight === "bold" ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateTextProperty("fontWeight", 
                        (selectedObject as fabric.IText).fontWeight === "bold" ? "normal" : "bold"
                      )}
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={(selectedObject as fabric.IText).fontStyle === "italic" ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateTextProperty("fontStyle",
                        (selectedObject as fabric.IText).fontStyle === "italic" ? "normal" : "italic"
                      )}
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-xs text-gray-500 uppercase tracking-wider">Alineación</Label>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant={(selectedObject as fabric.IText).textAlign === "left" ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateTextProperty("textAlign", "left")}
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={(selectedObject as fabric.IText).textAlign === "center" ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateTextProperty("textAlign", "center")}
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={(selectedObject as fabric.IText).textAlign === "right" ? "default" : "outline"}
                      size="icon"
                      onClick={() => updateTextProperty("textAlign", "right")}
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Color */}
            <div className="mb-4">
              <Label className="text-xs text-gray-500 uppercase tracking-wider">Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {templateColors && Object.values(templateColors).map((color, i) => (
                  <button
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => updateObjectColor(color)}
                  />
                ))}
                <input
                  type="color"
                  value={selectedObject.fill as string || "#000000"}
                  onChange={(e) => updateObjectColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Selecciona un elemento para editar sus propiedades</p>
          </div>
        )}

        {/* Save Actions */}
        <div className="mt-auto pt-6 border-t space-y-2">
          <Button 
            className="w-full bg-[#D4AF37] hover:bg-[#B8962E] text-white"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Guardar cambios
          </Button>
          <Button 
            variant="outline"
            className="w-full"
            onClick={downloadAsImage}
          >
            <Download className="w-4 h-4 mr-2" />
            Descargar imagen
          </Button>
        </div>
      </div>
    </div>
  );
}
