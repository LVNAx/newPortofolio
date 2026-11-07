import Hero from "@/components/sections/hero/Hero";
import About from "@/components/sections/about/About";
import AiLab from "@/components/sections/ailab/AiLab";
import Projects from "@/components/sections/projects/Projects";
import Cosmos from "@/components/sections/cosmos/Cosmos";
import Journey from "@/components/sections/journey/Journey";
import Contact from "@/components/sections/contact/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <AiLab />
      <Projects />
      <Cosmos />
      <Journey />
      <Contact />
    </>
  );
}
