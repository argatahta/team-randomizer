"use client";

import { useState, useEffect, useRef, useMemo } from "react";

import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  HStack,
  Stack,
  VStack,
  IconButton,
  useDisclosure,
  Dialog,
  Portal,
  CloseButton,
} from "@chakra-ui/react";
import { AiOutlineClose, AiOutlineEdit } from "react-icons/ai";

const maxLength = 20;

export default function Page() {
  const [members, setMembers] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");
  const [numTeams, setNumTeams] = useState(3);
  const [teams, setTeams] = useState<string[][]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const { open, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  const filteredMembers = useMemo(
    () => members.filter((m) => m.toLowerCase().includes(search.toLowerCase())),
    [members, search]
  );

  // Load members from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("soccer_members");
    if (saved) setMembers(JSON.parse(saved));
  }, []);

  // Save members to localStorage
  useEffect(() => {
    localStorage.setItem("soccer_members", JSON.stringify(members));
  }, [members]);

  const addMember = () => {
    const name = input.trim();
    if (
      name &&
      !members.some((m) => m.toLowerCase() === name.toLowerCase())
    ) {
      setMembers([...members, name]);
      setInput("");
    }
  };

  const removeMember = (name: string) => {
    setMembers(members.filter((m) => m.toLowerCase() !== name.toLowerCase()));
    if (
      editIndex !== null &&
      members[editIndex].toLowerCase() === name.toLowerCase()
    ) {
      setEditIndex(null);
      setEditValue("");
    }
  };

  const startEdit = (idx: number) => {
    setEditIndex(idx);
    setEditValue(members[idx]);
  };

  const saveEdit = (idx: number) => {
    const trimmed = editValue.trim();
    if (
      !trimmed ||
      members.some((m, i) => i !== idx && m.toLowerCase() === trimmed.toLowerCase())
    ) {
      setEditIndex(null);
      setEditValue("");
      return;
    }
    setMembers(members.map((m, i) => (i === idx ? trimmed : m)));
    setEditIndex(null);
    setEditValue("");
  };

  const clearAllMembers = () => {
    setMembers([]);
    setTeams([]);
    onClose();
  };

  const randomizeTeams = () => {
    const shuffled = [...members].sort(() => Math.random() - 0.5);
    const result: string[][] = Array.from({ length: numTeams }, () => []);
    shuffled.forEach((member, i) => {
      result[i % numTeams].push(member);
    });
    setTeams(result);
  };

  return (
    <Flex direction="column" maxW="600px" mx="auto" p={6} gap={4}>
      <Heading as="h1" size="lg" mb={2} textAlign="center">
        Team Randomizer
      </Heading>
      <Stack direction={{ base: "column", sm: "row" }}>
        <Input
          value={input}
          maxLength={maxLength}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add member name"
          onKeyDown={(e) => e.key === "Enter" && addMember()}
        />
        <Button onClick={addMember} colorPalette="teal">
          Add
        </Button>
      </Stack>

      {members.length > 0 && (
        <>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members"
            mb={2}
          />
          <VStack
            maxH="200px"
            overflowY="auto"
            borderWidth={1}
            borderRadius="md"
            p={2}
            align="stretch"
          >
            {filteredMembers.map((m) => {
              const realIdx = filteredMembers.indexOf(m);
              return (
                <HStack key={m} justify="space-between">
                  {editIndex === realIdx ? (
                    <HStack flex={1}>
                      <Input
                        size="sm"
                        maxLength={maxLength}
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(realIdx);
                          if (e.key === "Escape") setEditIndex(null);
                        }}
                      />
                      <Button
                        size="sm"
                        colorPalette="green"
                        onClick={() => saveEdit(realIdx)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditIndex(null)}
                      >
                        Cancel
                      </Button>
                    </HStack>
                  ) : (
                    <Text flex={1}>{m}</Text>
                  )}
                  <HStack>
                    <IconButton
                      aria-label={`Edit ${m}`}
                      size="xs"
                      colorPalette="yellow"
                      variant="ghost"
                      onClick={() => startEdit(realIdx)}
                      disabled={editIndex !== null}
                    >
                      <AiOutlineEdit />
                    </IconButton>
                    <IconButton
                      aria-label={`Remove ${m}`}
                      size="xs"
                      colorPalette="red"
                      variant="ghost"
                      onClick={() => removeMember(m)}
                      disabled={editIndex !== null}
                    >
                      <AiOutlineClose />
                    </IconButton>
                  </HStack>
                </HStack>
              );
            })}
          </VStack>
          <Text as="div" fontSize="sm" color="gray.500" textAlign="left">
            Total members: {members.length}
          </Text>
          <Button onClick={onOpen} colorPalette="red" variant="outline">
            Clear All
          </Button>
        </>
      )}

      <HStack justify="space-around">
        <HStack>
          <Text fontSize='sm'>Number of teams:</Text>
          <Input
            type="number"
            min={2}
            max={10}
            value={numTeams || undefined}
            onChange={(e) => setNumTeams(Number(e.target.value))}
            width="60px"
          />
        </HStack>

        <Button onClick={randomizeTeams} colorPalette="blue">
          Randomize Teams
        </Button>
      </HStack>
      <Dialog.Root placement="center" open={open}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Clear All Members</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Dialog.Description>
                  Are you sure? This will remove all members and cannot be
                  undone.
                </Dialog.Description>
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button ref={cancelRef} onClick={onClose}>
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button colorPalette="red" onClick={clearAllMembers} ml={3}>
                  Clear All
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger onClick={onClose} asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {teams.length > 0 && (
        <Flex gap={4} wrap="wrap" justify="center">
          {teams.map((team, i) => (
            <Box
              key={i}
              borderWidth={1}
              borderRadius="lg"
              p={4}
              width="100%"
              sm={{ width: "10rem" }}
              flex="1 1 160px"
              bg="gray.50"
              display="flex"
              flexDirection="column"
              alignItems="center"
            >
              <Heading as="h3" size="md" mb={2} textAlign="center">
            Team {i + 1}
              </Heading>
              <Box borderBottomWidth={1} mb={2} width="100%" />
              <VStack align="stretch" width="100%">
            {team.map((member) => (
              <Text key={member}>{member}</Text>
            ))}
              </VStack>
            </Box>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
