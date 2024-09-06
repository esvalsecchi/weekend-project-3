"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useChat } from "ai/react"; // Reemplaza con la librería correcta o el path adecuado
import { Trash as TrashIcon, FilePen as FilePenIcon } from "lucide-react"

// Add this type definition at the top of the file, after the imports
type Character = {
  id: number;
  name: string;
  description: string;
  personality: string;
};

export function Characters() {
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: 1,
      name: "Zara the Adventurer",
      description: "A brave and curious explorer, always seeking new discoveries.",
      personality: "Adventurous, Curious, Determined",
    },
    {
      id: 2,
      name: "Finn the Tinkerer",
      description: "A creative inventor who loves building gadgets and machines.",
      personality: "Innovative, Analytical, Playful",
    },
    {
      id: 3,
      name: "Lily the Enchantress",
      description: "A powerful mage with a deep connection to the natural world.",
      personality: "Mystical, Compassionate, Mischievous",
    },
  ]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);

  // Use useChat hook
  const { messages, append, isLoading, setMessages } = useChat();

  const handleAddCharacter = () => {
    setSelectedCharacter(null);
    setShowDialog(true);
  }

  const handleEditCharacter = (character: Character) => {
    setSelectedCharacter(character);
    setShowDialog(true);
  }

  const handleDeleteCharacter = (id: number) => {
    setCharacters(characters.filter((char) => char.id !== id));
  }

  const handleSaveCharacter = (character: Character) => {
    if (selectedCharacter) {
      setCharacters(characters.map((char) => (char.id === character.id ? character : char)));
    } else {
      setCharacters([...characters, { ...character, id: characters.length + 1 }]);
    }
    setShowDialog(false);
  }

  const handleGenerateStory = () => {
    // Limpiar mensajes anteriores antes de generar una nueva historia
    setMessages([]);

    // Llamada a append para generar la historia con personajes actualizados
    append({ role: "user", content: JSON.stringify({ characters }) });
  }

  const filterMessageContent = (content: string) => {
    try {
      const parsedContent = JSON.parse(content);
      if (parsedContent.characters) {
        // Elimina la parte que no deseas mostrar
        return "";
      }
      return content; // Si no es el JSON con personajes, muestra el contenido
    } catch (error) {
      return content; // Si no es un JSON válido, muestra el contenido original
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Character Management</h1>
        <Button onClick={handleAddCharacter}>Add Character</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Personality</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {characters.map((character) => (
            <TableRow key={character.id}>
              <TableCell>{character.name}</TableCell>
              <TableCell>{character.description}</TableCell>
              <TableCell>{character.personality}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditCharacter(character)}>
                    <FilePenIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCharacter(character.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="p-6" style={{ background: "white" }}>
            <DialogHeader>
              <DialogTitle>{selectedCharacter ? "Edit Character" : "Add Character"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={selectedCharacter?.name} placeholder="Enter character name" />
                </div>
                <div>
                  <Label htmlFor="personality">Personality</Label>
                  <Input
                    id="personality"
                    defaultValue={selectedCharacter?.personality}
                    placeholder="Enter character personality"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  defaultValue={selectedCharacter?.description}
                  placeholder="Enter character description"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                onClick={() =>
                  handleSaveCharacter({
                    id: selectedCharacter?.id ?? characters.length + 1,
                    name: (document.getElementById("name") as HTMLInputElement)?.value ?? "",
                    description: (document.getElementById("description") as HTMLTextAreaElement)?.value ?? "",
                    personality: (document.getElementById("personality") as HTMLInputElement)?.value ?? "",
                  })
                }
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className="mt-8">
        <Button onClick={handleGenerateStory} disabled={isLoading}>Generate Story</Button>
        {isLoading && <div className="mt-4">Loading...</div>}
        {messages.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Generated Story</h2>
            <div className="prose">{messages.map((message, index) => (
              <p key={index}>{filterMessageContent(message.content)}</p>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}
