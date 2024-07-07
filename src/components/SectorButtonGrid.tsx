import React, { useCallback } from "react";
import { Button, Grid, Row, Col } from "antd";
import sectorColors from "@assets/sectorColors";

const { useBreakpoint } = Grid;

export type SectorButtonGridProps = {
  onClick?: (
    sectorName: string,
    evt: React.MouseEvent<HTMLElement, MouseEvent>
  ) => void;
};

export default function SectorButtonGrid({
  onClick,
  ...args
}: SectorButtonGridProps) {
  const handleClick = useCallback(
    (sectorName: string, evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (typeof onClick === "function") {
        onClick(sectorName, evt);
      }
    },
    [onClick]
  );

  const screens = useBreakpoint();

  return (
    <div style={{ padding: "20px" }} {...args}>
      <Row gutter={[16, 16]}>
        {sectorColors.map((sector) => (
          <Col
            xs={24}
            sm={screens.sm ? 12 : 24}
            md={screens.md ? 8 : 12}
            lg={screens.lg ? 6 : 12}
            key={sector.name}
          >
            <Button
              onClick={(evt) => handleClick(sector.name, evt)}
              style={{
                width: "100%",
                backgroundColor: sector.color,
                color: sector.inverseColor,
                borderColor: sector.color,
                paddingTop: 40,
                paddingBottom: 40,
                border: `1px ${sector.inverseColor} dotted`,
              }}
            >
              {sector.name}
            </Button>
          </Col>
        ))}
      </Row>
    </div>
  );
}
